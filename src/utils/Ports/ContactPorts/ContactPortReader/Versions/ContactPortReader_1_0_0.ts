import { z } from 'zod';

import { DEFAULT_NAME, NAME_LENGTH_LIMIT, ORG_NAME } from '@configs/constants';

import CryptoDriver from '@utils/Crypto/CryptoDriver';
import DirectChat from '@utils/DirectChats/DirectChat';
import { readerInitialInfoSend } from '@utils/DirectChats/initialInfoExchange';
import { generateRandomHexId } from '@utils/IdGenerator';
import { ContentType, MessageStatus } from '@utils/Messaging/interfaces';
import { setRemoteNotificationPermissionForDirectChat } from '@utils/Notifications';
import { DirectContactPortBundle } from "@utils/Ports/interfaces";
import { getProfileName } from '@utils/Profile';
import { isUserBlocked } from '@utils/Storage/blockUsers';
import { addConnection, getBasicConnectionInfo, getChatIdFromPairHash, updateConnectionOnNewMessage } from '@utils/Storage/connections';
import { addContact } from '@utils/Storage/contacts';
import { ChatType } from '@utils/Storage/DBCalls/connections';
import { LineDataEntry } from '@utils/Storage/DBCalls/lines';
import { PermissionsStrict } from '@utils/Storage/DBCalls/permissions/interfaces';
import { BundleTarget } from '@utils/Storage/DBCalls/ports/interfaces';
import { ReadPortData } from '@utils/Storage/DBCalls/ports/readPorts';
import { addLine , readLineData } from '@utils/Storage/lines';
import * as permissionStorage from '@utils/Storage/permissions';
import * as storageReadPorts from '@utils/Storage/readPorts';
import { generateISOTimeStamp, hasExpired } from '@utils/Time';

import * as API from '../APICalls';
import ContactPortReader from "../ContactPortReader";

const CONTACT_PORT_READER_VERSION = '1.0.0';

const ContactPortBundleSchema = z.object({
  portId: z.string().length(32).regex(/^[0-9a-f]{32}$/),
  version: z.literal(CONTACT_PORT_READER_VERSION),
  org: z.literal(ORG_NAME),
  target: z.literal(BundleTarget.contactPort),
  name: z.string().max(NAME_LENGTH_LIMIT).optional(),
  rad: z.string().length(32).regex(/^[0-9a-f]{32}$/),
  keyHash: z.string().length(64).regex(/^[0-9a-f]{64}$/),
  pubkey: z.string().length(64).regex(/^[0-9a-f]{64}$/),
  expiryTimestamp: z.string().datetime().optional(),
  ticket: z.string().length(32).regex(/^[0-9a-f]{32}$/),
});

interface PlaintextSecretContent {
  rad: string;
  name: string;
  ticket: string;
}

type ContactPortBundle_1_0_0 = z.infer<typeof ContactPortBundleSchema>;

class ContactPortReader_1_0_0 extends ContactPortReader {
  version: string = CONTACT_PORT_READER_VERSION;

  /**
   * Validates the contact port bundle
   * @param bundleData - The contact port bundle data to validate.
   * @returns The validated contact port bundle.
   * @throws {Error} If the bundle data is invalid.
   */
  static validateBundle(bundleData: any): DirectContactPortBundle {
    const parsedBundle: ContactPortBundle_1_0_0 = ContactPortBundleSchema.parse(bundleData);
    // DirectContactPortBundle is a superset of ContactPortBundle_1_0_0
    return parsedBundle as DirectContactPortBundle;
  }

  /**
   * Accepts the contact port bundle
   * @param bundleData - The contact port bundle data to accept.
   * @param permissions - The permissions to assign to the contact port.
   * @param folderId - The folder ID to assign to the contact port.
   * @returns The accepted contact port bundle.
   */
  static async accept(bundleData: DirectContactPortBundle, permissions: PermissionsStrict, folderId: string): Promise<ReadPortData | null> {
    try {
      //we can assume that bundle data is validated
      const validatedBundle = bundleData as ContactPortBundle_1_0_0;
      //setup crypto
      const cryptoDriver = new CryptoDriver();
      await cryptoDriver.create();
      await cryptoDriver.updatePeerPublicKeyHashAndRad(
        validatedBundle.keyHash,
        validatedBundle.rad,
      );
      cryptoDriver.updateSharedSecret(validatedBundle.pubkey);
      const cryptoId = cryptoDriver.getCryptoId();
      //setup permissions
      const permissionsId = generateRandomHexId();
      await permissionStorage.addPermissionEntry({
        permissionsId: permissionsId,
        ...permissions,
      });
      const portData: ReadPortData = {
        portId: validatedBundle.portId,
        version: validatedBundle.version,
        target: validatedBundle.target,
        name: validatedBundle.name || DEFAULT_NAME,
        usedOnTimestamp: generateISOTimeStamp(),
        expiryTimestamp: validatedBundle.expiryTimestamp,
        ticket: validatedBundle.ticket,
        folderId: folderId,
        cryptoId: cryptoId,
        permissionsId: permissionsId,
      }
      //save read port
      await storageReadPorts.newReadPort(portData);
      return portData;
    } catch (error) {
      console.error('Error accepting contact port bundle: ', error);
      return null;
    }
  }

  /**
   * Cleans up the read port
   */
  async clean() {
    try {
      //delete read port from storage
      await storageReadPorts.deleteReadPortData(this.portData.portId);
      if (this.portData.cryptoId) {
        const cryptoDriver = new CryptoDriver(this.portData.cryptoId);
        await cryptoDriver.deleteCryptoData();
      }
      if (this.portData.permissionsId) {
        await permissionStorage.clearPermissions(this.portData.permissionsId);
      }
    } catch (error) {
      console.log('Error cleaning up read port: ', error);
    }
  }

  /**
   * Generates an intro message for the read port before using it to form a chat.
   * @returns intro message
   */
  private async generateIntroMessage(): Promise<API.IntroMessage> {
    try {
      const name = await getProfileName();
      const cryptoDriver = new CryptoDriver(this.portData.cryptoId);
      const rad = await cryptoDriver.getRad();
      const plaintextSecret: PlaintextSecretContent = {
        name,
        rad,
        ticket: this.portData.ticket as string, //always exists
      };
      const encryptedSecretContent = await cryptoDriver.encrypt(
        JSON.stringify(plaintextSecret),
      );
      return { pubkey: await cryptoDriver.getPublicKey(), encryptedSecretContent };
    } catch (error) {
      console.log('Error generating intro message: ', error);
      throw new Error('Error generating intro message');
    }
  }

  /**
   * Creates default permissions for the read port in case it doesn't exist.
   * Read Ports before version 1.0.0 might not have permissions.
   */
  private async createPermissions() {
    const permissionsId = generateRandomHexId();
    const defaultPermissions = await permissionStorage.getPermissions();
    await permissionStorage.addPermissionEntry({
      permissionsId: permissionsId,
      ...defaultPermissions,
    });
    this.portData = { ...this.portData, permissionsId: permissionsId };
    await storageReadPorts.updateReadPort(this.portData.portId, this.portData);
  }

  /**
   * Uses the read port to form a chat
   */
  async use() {
    //declare variables
    let lineId: string | null = null;
    let pairHash: string | null = null;
    try {
      //run basic checks
      //check cryptoId exists
      if (!this.portData.cryptoId) {
        throw new Error('NoCryptoId');
      }
      //if permissions don't exist, create them.  
      if (!this.portData.permissionsId) {
        await this.createPermissions();
      }
      //check expiry timestamp
      if (hasExpired(this.portData.expiryTimestamp)) {
        throw new Error('Attempted to use an expired port');
      }
      //generate intro message
      const introMessage = await this.generateIntroMessage();
      //we catch the error here to prevent the port from being cleaned up if any of the API calls fail
      try {
        const result = await API.newDirectChatFromContactPort(
          this.portData.portId,
          introMessage,
          this.portData.ticket as string,
        );
        lineId = result.lineId;
        pairHash = result.pairHash;
      } catch (error) {
        console.log('Temporary error using read contact port: ', error);
        console.log('We are not cleaning up the read contact port as it is still usable');
        return;
      }
      //run additional checks
      if (!lineId || !pairHash) {
        throw new Error('LineId and PairHash not returned from API');
      }
      //If user is blocked, don't form a chat
      if (await isUserBlocked(pairHash)) {
        throw new Error('UserIsBlocked');
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
          name: this.portData.name || DEFAULT_NAME,
          connectedOn: generateISOTimeStamp(),
        });
      }
      //delete read port data from storage. don't clean delete since permissions and crypto data references are still needed.
      await storageReadPorts.deleteReadPortData(this.portData.portId);
      //set remote notification permission for the line
      const permissions = await permissionStorage.getPermissions(this.portData.permissionsId);
      setRemoteNotificationPermissionForDirectChat(lineId, permissions.notifications, true);
      //send reader initial info messages
      readerInitialInfoSend(associatedChatId);
    } catch (error) {
      console.log('Error using read contact port: ', error);
      console.log('Cleaning up the read contact port as it is not usable');
      await this.clean();
      if (lineId) {
        console.log('Informing server of failure to form chat on the reader side.');
        await DirectChat.cleanDeleteLine(lineId);
        DirectChat.informServerOfDisconnection(lineId);
      }
      return;
    }
  }
}

export default ContactPortReader_1_0_0;