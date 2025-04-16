import {BUNDLE_ID_PREPEND_LINK} from '@configs/api';
import {DEFAULT_NAME, ORG_NAME} from '@configs/constants';

import CryptoDriver from '@utils/Crypto/CryptoDriver';
import DirectChat from '@utils/DirectChats/DirectChat';
import { generatorInitialInfoSend } from '@utils/DirectChats/initialInfoExchange';
import {generateRandomHexId} from '@utils/IdGenerator';
import {jsonToUrl} from '@utils/JsonToUrl';
import { ContentType, MessageStatus } from '@utils/Messaging/interfaces';
import { setRemoteNotificationPermissionForDirectChat } from '@utils/Notifications';
import {getBundleId} from '@utils/Ports/APICalls';
import {DirectSuperportBundle} from '@utils/Ports/interfaces';
import { isUserBlocked } from '@utils/Storage/blockUsers';
import { addConnection, getBasicConnectionInfo, getChatIdFromPairHash, updateConnectionOnNewMessage } from '@utils/Storage/connections';
import { addContact } from '@utils/Storage/contacts';
import { ChatType } from '@utils/Storage/DBCalls/connections';
import { LineDataEntry } from '@utils/Storage/DBCalls/lines';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';
import {SuperportData} from '@utils/Storage/DBCalls/ports/superPorts';
import { addLine, checkLineExists, readLineData } from '@utils/Storage/lines';
import * as permissionStorage from '@utils/Storage/permissions';
import * as storage from '@utils/Storage/superPorts';
import {generateISOTimeStamp} from '@utils/Time';

import * as APICalls from '../APICalls';
import SuperPortGenerator from '../SuperPortGenerator';

const SUPERPORT_GENERATOR_VERSION = '1.0.0';

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

class SuperPortGenerator_1_0_0 extends SuperPortGenerator {
  version: string = SUPERPORT_GENERATOR_VERSION;

  /**
   * Creates a new super port
   * @param label - The label of the super port
   * @param limit - The limit of the super port
   * @param folderId - The folder id of the super port
   * @param permissions - The permissions of the super port
   * @returns the super port data
   */
  static async create(
    label: string,
    limit: number,
    folderId: string,
    permissions: PermissionsStrict,
  ): Promise<SuperportData | null> {
    try {
      // gets new super port Id
      const portId = await APICalls.getNewDirectSuperport(limit);
      // creates crypto data
      const cryptoDriver = new CryptoDriver();
      await cryptoDriver.create();
      const cryptoId = cryptoDriver.getCryptoId();
      const permissionsId = generateRandomHexId();
      await permissionStorage.addPermissionEntry({
        permissionsId: permissionsId,
        ...permissions,
      });
      const superPortData: SuperportData = {
        portId: portId,
        version: SUPERPORT_GENERATOR_VERSION,
        label: label,
        createdOnTimestamp: generateISOTimeStamp(),
        cryptoId: cryptoId,
        connectionsLimit: limit,
        connectionsMade: 0,
        paused: false,
        permissionsId: permissionsId,
        folderId: folderId,
      };
      await storage.addSuperport(superPortData);
      return superPortData;
    } catch (error) {
      console.log('Error creating super port: ', error);
      return null;
    }
  }


  /**
   * Gets the version of the super port generator
   * @returns the version of the super port generator
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * Gets the super port data
   * @returns the super port data
   */
  getPort(): SuperportData {
    return this.portData;
  }

  /**
   * Updates the super port name
   * @param name - The name of the super port
   */
  async updateSuperPortName(name: string): Promise<void> {
    await storage.updateSuperportData(this.portData.portId, {
      label: name,
    });
  }

  /**
   * Updates the super port limit
   * @param limit - The limit of the super port
   */
  async updateSuperPortLimit(limit: number): Promise<void> {
    if (limit < this.portData.connectionsMade) {
      throw new Error(
        'Limit cannot be less than the number of connections made',
      );
    }
    await storage.updateSuperportData(this.portData.portId, {
      connectionsLimit: limit,
    });
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
    await storage.updateSuperportData(this.portData.portId, this.portData);
  }

  /**
   * Updates the super port permissions
   * @param permissions - The permissions of the super port
   */
  async updateSuperPortPermissions(
    permissions: PermissionsStrict,
  ): Promise<void> {
    if (!this.portData.permissionsId) {
      await this.createPermissions();
    }
    await permissionStorage.updatePermissions(
      this.portData.permissionsId,
      permissions,
    );
  }

  /**
   * Pauses the super port
   */
  async pause(): Promise<void> {
      //paused associated superport
      await APICalls.pauseDirectSuperport(this.portData.portId);
      //pause superport locally
      await storage.pauseSuperport(this.portData.portId);
      this.portData = {...this.portData, paused: true};
  }

  /**
   * Resumes the super port
   */
  async resume(): Promise<void> {
      //resume a paused superport
      await APICalls.resumeDirectSuperport(this.portData.portId);
      //resume a paused superport locally
      await storage.unpauseSuperport(this.portData.portId);
      this.portData = {...this.portData, paused: false};
  }

  /**
   * Gets a shareable bundle for the super port
   * @param name - The name of the super port
   * @returns the shareable bundle
   */
  async getShareableBundle(name: string): Promise<DirectSuperportBundle> {
    const cryptoDriver = new CryptoDriver(this.portData.cryptoId);
    const rad = await cryptoDriver.getRad();
    const keyHash = await cryptoDriver.getPublicKeyHash();
    const pubkey = await cryptoDriver.getPublicKey();
    // returns a bundle to display
    const displayBundle: DirectSuperportBundle = {
      portId: this.portData.portId,
      version: this.portData.version,
      org: ORG_NAME,
      target: BundleTarget.superportDirect,
      name: name,
      rad: rad,
      keyHash: keyHash,
      pubkey: pubkey,
    };
    return displayBundle;
  }

  /**
   * Gets a shareable link for the super port
   * @param name - The name of the super port
   * @returns the shareable link
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
      const bundleId = await getBundleId(JSON.stringify(bundle), true);
      await storage.updateSuperportData(this.portData.portId, {
        bundleId: bundleId,
      });
      this.portData = {...this.portData, bundleId: bundleId};
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
   * Deletes the super port from server and storage
   */
  async clean(): Promise<void> {
      await APICalls.deleteDirectSuperport(this.portData.portId);
      await storage.deleteSuperPortData(this.portData.portId);
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
   * @param introMessage - The intro message sent by the SuperPort reader
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
   * Increments the connections made and updates the super port data
   */
  private async incrementConnectionsMade() {
    await storage.incrementConnectionsMade(
      this.portData.portId,
      generateISOTimeStamp(),
    );
    this.portData = {...this.portData, connectionsMade: this.portData.connectionsMade + 1};
  }

  /**
   * Uses a super port to form a new chat
   * @param lineId - The line ID created by the server for the new chat.
   * @param pairHash - The unique pair hash for the user pair.
   * @param introMessage - The intro message sent by the SuperPort reader.
   */
  async use(lineId: string, pairHash: string, introMessage: IntroMessage) {
    try {
      //run basic checks before attempting to use the super port.
      //if chat is already formed, this guard prevents retrying new chat over super port.
      if (await checkLineExists(lineId)) {
        return;
      }
      //if permissions don't exist, create them.
      if (!this.portData.permissionsId) {
        await this.createPermissions();
      }
      //if super port is paused or has hit the connection limit, inform the server and throw an error.
      if (this.portData.paused || this.portData.connectionsMade === this.portData.connectionsLimit) {
        this.pause();
        throw new Error('Attempted to use a paused port');
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
      //create duplicate crypto entry and permissions entry.
      const superportCryptoDriver = new CryptoDriver(this.portData.cryptoId);
      const cryptoDriver = new CryptoDriver();
      await cryptoDriver.create(await superportCryptoDriver.getData());
      const cryptoId = cryptoDriver.getCryptoId();
      const permissionsId = generateRandomHexId();
      await permissionStorage.addPermissionEntry({
        permissionsId: permissionsId,
        ...(await permissionStorage.getPermissions(this.portData.permissionsId)),
      });
      //add line to db
      await addLine({
        lineId: lineId,
        authenticated: true,
        disconnected: false,
        cryptoId: cryptoId,
        permissionsId: permissionsId,
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
          name: plaintextSecret.name || DEFAULT_NAME,
          connectedOn: generateISOTimeStamp(),
          connectionSource: 'superport://' + this.portData.portId
        });
      }
      //increase the count of connections made using this superport
      await this.incrementConnectionsMade();
      //set remote notification permission for the line
      const permissions = await permissionStorage.getPermissions(this.portData.permissionsId);
      setRemoteNotificationPermissionForDirectChat(lineId, permissions.notifications, true);
      //check if superport limit is reached with this connection. If so, try to pause superport
      if (
        this.portData.connectionsMade ===
        this.portData.connectionsLimit
      ) {
        try {
          //pause superport
          this.pause();
        } catch (error) {
          console.log('Error pausing super port after connection limit reached: ', error);
        }
      }
      //send generator initial info messages
      generatorInitialInfoSend(associatedChatId);
    } catch (error) {
      console.log('Error using created super port: ', error);
      console.log('Informing server of failure to form chat on the super portgenerator side.');
      await DirectChat.cleanDeleteLine(lineId);
      DirectChat.informServerOfDisconnection(lineId);
      return;
    }
  }
}

export default SuperPortGenerator_1_0_0;
