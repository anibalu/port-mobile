import { BUNDLE_ID_PREPEND_LINK } from '@configs/api';
import { DEFAULT_NAME, IDEAL_UNUSED_PORTS_NUMBER, ORG_NAME } from '@configs/constants';

import CryptoDriver from '@utils/Crypto/CryptoDriver';
import DirectChat from '@utils/DirectChats/DirectChat';
import { generatorInitialInfoSend } from '@utils/DirectChats/initialInfoExchange';
import { generateRandomHexId } from '@utils/IdGenerator';
import { jsonToUrl } from '@utils/JsonToUrl';
import { ContentType, MessageStatus } from '@utils/Messaging/interfaces';
import { setRemoteNotificationPermissionForDirectChat } from '@utils/Notifications';
import { getBundleId } from '@utils/Ports/APICalls';
import { PortBundle } from '@utils/Ports/interfaces';
import { isUserBlocked } from '@utils/Storage/blockUsers';
import { addConnection, getBasicConnectionInfo, getChatIdFromPairHash, updateConnectionOnNewMessage } from '@utils/Storage/connections';
import { addContact } from '@utils/Storage/contacts';
import { ChatType } from '@utils/Storage/DBCalls/connections';
import { LineDataEntry } from '@utils/Storage/DBCalls/lines';
import { PermissionsStrict } from '@utils/Storage/DBCalls/permissions/interfaces';
import { BundleTarget } from '@utils/Storage/DBCalls/ports/interfaces';
import { PortData } from '@utils/Storage/DBCalls/ports/myPorts';
import { addLine, checkLineExists, readLineData } from '@utils/Storage/lines';
import * as storage from '@utils/Storage/myPorts';
import * as permissionStorage from '@utils/Storage/permissions';
import { generateISOTimeStamp, getExpiryTimestamp, hasExpired } from '@utils/Time';
import { expiryOptions } from '@utils/Time/interfaces';

import * as API from '../APICalls';
import PortGenerator from '../PortGenerator';

const PORT_GENERATOR_VERSION = '1.0.0';

/**
 * Intro message received from the port reader after a successful port use.
 */
interface IntroMessage {
  pubkey: string;
  encryptedSecretContent: string;
}

/**
 * Decrypted version of intro message secret content.
 */
interface PlaintextSecretContent {
  rad: string;
  name: string;
}

class PortGenerator_1_0_0 extends PortGenerator {
  version: string = PORT_GENERATOR_VERSION;

  /**
   * Tries to get an unused port from storage.
   * If there are no unused ports, it will get more ports from the server.
   * @returns unused Port Id.
   */
  static async getUnusedPort(): Promise<string> {
    const unusedPort = await storage.getUnusedPort();
    if (
      !unusedPort.portId ||
      unusedPort.remainingPorts < IDEAL_UNUSED_PORTS_NUMBER
    ) {
      // makes an api to get more ports
      await PortGenerator_1_0_0.fetchNewPorts();
      if (!unusedPort.portId) {
        const newUnusedPort = await storage.getUnusedPort();
        if (!newUnusedPort.portId) {
          throw new Error('NoAvailabeUnusedPort');
        }
        return newUnusedPort.portId;
      }
      return unusedPort.portId;
    }
    return unusedPort.portId;
  }

  /**
   * Fetches new ports from the server and saves them to storage.
   */
  static async fetchNewPorts(): Promise<void> {
    try {
      const portIds = await API.getNewPorts();
      await storage.newPorts(portIds);
    } catch (error) {
      console.log('Error getting new ports: ', error);
    }
  }

  /**
   * Creates a new port with the specified folder ID and permissions.
   * @param contactName - The name of the contact to create the port for.
   * @param folderId - The folder ID to create the port in.
   * @param permissions - The permissions for the port.
   * @returns The created port data or null if error
   */
  static async create(
    contactName: string,
    folderId: string,
    permissions: PermissionsStrict,
  ): Promise<PortData | null> {
    try {
      // gets unused port Id
      const portId = await PortGenerator_1_0_0.getUnusedPort();
      // creates crypto data
      const cryptoDriver = new CryptoDriver();
      await cryptoDriver.create();
      const cryptoId = cryptoDriver.getCryptoId();
      const currentTimestamp = generateISOTimeStamp();
      const expiryTimestamp = getExpiryTimestamp(
        currentTimestamp,
        expiryOptions[4],
      );
      const permissionsId = generateRandomHexId();
      await permissionStorage.addPermissionEntry({
        permissionsId: permissionsId,
        ...permissions,
      });
      const portData: PortData = {
        portId: portId,
        version: PORT_GENERATOR_VERSION,
        label: contactName,
        usedOnTimestamp: currentTimestamp,
        expiryTimestamp: expiryTimestamp,
        cryptoId: cryptoId,
        folderId: folderId,
        permissionsId: permissionsId,
      };
      await storage.updatePortData(portId, portData);
      return portData;
    } catch (error) {
      console.log('Error creating port: ', error);
      return null;
    }
  }

  /**
   * Gets the version of the port generator
   * @returns the version of the port generator
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * Gets port data
   * @returns port data
   */
  getPort(): PortData {
    return this.portData;
  }

  /**
   * updates contact name
   * @param name of the contact
   */
  async updateContactName(name: string) {
    await storage.updatePortData(this.portData.portId, { label: name });
  }

  /**
   * Creates default permissions for the port in case it doesn't exist.
   * Ports before version 1.0.0 might not have permissions.
   */
  private async createPermissions() {
    const permissionsId = generateRandomHexId();
    const defaultPermissions = await permissionStorage.getPermissions();
    await permissionStorage.addPermissionEntry({
      permissionsId: permissionsId,
      ...defaultPermissions,
    });
    this.portData = { ...this.portData, permissionsId: permissionsId };
    await storage.updatePortData(this.portData.portId, this.portData);
  }

  /**
   * updates permissions
   * @param permissions of the port
   */
  async updatePermissions(permissions: PermissionsStrict) {
    if (!this.portData.permissionsId) {
      await this.createPermissions();
    }
    await permissionStorage.updatePermissions(
      this.portData.permissionsId,
      permissions,
    );
  }

  /**
   * Gets a shareable bundle
   * @param name name to include in the bundle
   * @returns a bundle
   */
  async getShareableBundle(name: string): Promise<PortBundle> {
    const cryptoDriver = new CryptoDriver(this.portData.cryptoId);
    const rad = await cryptoDriver.getRad();
    const keyHash = await cryptoDriver.getPublicKeyHash();
    const pubkey = await cryptoDriver.getPublicKey();
    // returns a bundle to display
    const displayBundle: PortBundle = {
      portId: this.portData.portId,
      version: this.portData.version,
      org: ORG_NAME,
      target: BundleTarget.direct,
      name: name,
      rad: rad,
      keyHash,
      pubkey,
    };
    return displayBundle;
  }

  /**
   * Gets a shareable link for the port
   * @param name Name to include in the shared link
   * @returns A shareable link - either a shortened bundleId link or full port data link
   * @throws Error if unable to generate any valid link
   */
  async getShareableLink(name: string): Promise<string> {
    if (this.portData.bundleId) {
      const bundleId =
        this.portData.bundleId.substring(0, 7) === 'link://'
          ? this.portData.bundleId.replace('link://', '') //to handle older methods of storing bundleId.
          : this.portData.bundleId;
      return BUNDLE_ID_PREPEND_LINK + bundleId;
    }
    //Else create a new shortened link, store it and return it.
    //If that fails, construct the port data as a link.
    const bundle = await this.getShareableBundle(name);
    try {
      const bundleId = await getBundleId(JSON.stringify(bundle));
      await storage.updatePortData(this.portData.portId, {
        bundleId: bundleId,
      });
      this.portData = { ...this.portData, bundleId: bundleId };
      return BUNDLE_ID_PREPEND_LINK + bundleId;
    } catch (error) {
      console.log('Error getting shareable link: ', error);
      //If that fails, construct the port data as a link.
      const longLink = jsonToUrl(bundle as any);
      if (!longLink) {
        throw new Error('Error getting shareable link');
      }
      return longLink;
    }
  }

  /**
   * Deletes port data from storage
   */
  async clean() {
    // deletes port data from storage
    await storage.deletePortData(this.portData.portId);
    if (this.portData.cryptoId) {
      const cryptoDriver = new CryptoDriver(this.portData.cryptoId);
      await cryptoDriver.deleteCryptoData();
    }
    if (this.portData.permissionsId) {
      await permissionStorage.clearPermissions(this.portData.permissionsId);
    }
  }

  /**
   * Verifies the intro message
   * @param introMessage - The intro message sent by the Port reader
   * @returns The plaintext secret content
   */
  private async verifyIntroMessage(introMessage: IntroMessage): Promise<PlaintextSecretContent> {
    try {
      if (!introMessage || !introMessage.pubkey || !introMessage.encryptedSecretContent) {
        throw new Error('Intro message is missing required fields');
      }
      const cryptoDriver = new CryptoDriver(this.portData.cryptoId);
      await cryptoDriver.updateSharedSecret(introMessage.pubkey);
      const plaintextSecret = JSON.parse(
        await cryptoDriver.decrypt(introMessage.encryptedSecretContent),
      ) as PlaintextSecretContent;
      if (!((await cryptoDriver.getRad()) === plaintextSecret.rad)) {
        throw new Error('Intro message verification failed');
      }
      return plaintextSecret;
    } catch (error) {
      console.log('Error verifying intro message: ', error);
      throw new Error('Invalid intro message');
    }
  }

  /**
   * Uses a port to form a new chat
   * @param lineId - The line ID created by the server for the new chat.
   * @param pairHash - The unique pair hash for the user pair.
   * @param introMessage - The intro message sent by the Port reader.
   */
  async use(lineId: string, pairHash: string, introMessage: IntroMessage) {
    try {
      //run basic checks before attempting to use the port.
      //if chat is already formed, this guard prevents retrying new chat over generated port.
      if (await checkLineExists(lineId)) {
        return;
      }
      //if permissions don't exist, create them.
      if (!this.portData.permissionsId) {
        await this.createPermissions();
      }
      //if port has expired, cleanup and throw an error.
      if (hasExpired(this.portData.expiryTimestamp)) {
        throw new Error('Attempted to use an expired port');
      }
      //validate intro message
      const plaintextSecret = await this.verifyIntroMessage(introMessage);
      //Ensure user is not blocked
      if (await isUserBlocked(pairHash)) {
        throw new Error('User is blocked');
      }
      //Ensure active connection does not exist for the pairHash
      let associatedChatId: string | null = await getChatIdFromPairHash(pairHash);
      let lineData: LineDataEntry | null = null;
      if (associatedChatId) {
        console.log('Existing chatId found for pairHash: ', associatedChatId);
        const existingConnection = await getBasicConnectionInfo(associatedChatId);
        lineData = await readLineData(
          existingConnection.routingId,
        );
        if (lineData && !lineData.disconnected) {
          throw new Error('Connection already exists for the pairHash');
        }
      }
      //add line to db
      await addLine({
        lineId: lineId,
        authenticated: true,
        disconnected: false,
        cryptoId: this.portData.cryptoId,
        permissionsId: this.portData.permissionsId,
      });

      if (associatedChatId) {
        //update existing connection with new lineId
        await updateConnectionOnNewMessage({
          chatId: associatedChatId,
          routingId: lineId,
        });
        //clean delete old lineId and associated data
        if (lineData) {
          await DirectChat.cleanDeleteLine(lineData.lineId, lineData);
        }
      } else {
        //generate new chatId
        associatedChatId = generateRandomHexId();
        //add new connection
        await addConnection({
          chatId: associatedChatId,
          connectionType: ChatType.direct,
          recentMessageType: ContentType.newChat,
          readStatus: MessageStatus.latest,
          timestamp: generateISOTimeStamp(),
          newMessageCount: 0,
          folderId: this.portData.folderId,
          pairHash: pairHash,
          routingId: lineId,
        });
        //add contact since pairHash is new
        await addContact({
          pairHash: pairHash,
          name: this.portData.label || plaintextSecret.name || DEFAULT_NAME,
          connectedOn: generateISOTimeStamp(),
        });
      }
      //delete generated port data from storage. don't clean delete since permissions and crypto data references are still needed.
      await storage.deletePortData(this.portData.portId);
      //set remote notification permission for the line
      const permissions = await permissionStorage.getPermissions(this.portData.permissionsId);
      setRemoteNotificationPermissionForDirectChat(lineId, permissions.notifications, true);
      //send generator initial info messages
      generatorInitialInfoSend(associatedChatId);
    } catch (error) {
      console.log('Error using generated port: ', error);
      console.log('Error suggests that the generated port has been compromised. Cleaning up the port.');
      await this.clean();
      console.log('Informing server of failure to form chat on the generator side.');
      await DirectChat.cleanDeleteLine(lineId);
      DirectChat.informServerOfDisconnection(lineId);
      return;
    }
  }
}

export default PortGenerator_1_0_0;
