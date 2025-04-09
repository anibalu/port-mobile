import * as storage from '@utils/Storage/lines';
import * as API from './APICalls';
import {
  deleteConnection,
  getBasicConnectionInfo,
  getChatIdFromPairHash,
  getChatIdFromRoutingId,
  updateConnectionOnNewMessage,
  addConnection,
} from '@utils/Storage/connections';
import {ChatType} from '@utils/Storage/DBCalls/connections';
import {ContentType, MessageStatus} from '@utils/Messaging/interfaces';
import {generateISOTimeStamp} from '@utils/Time';
import {
  DirectPermissions,
  Permissions,
} from '@utils/Storage/DBCalls/permissions/interfaces';
import {
  clearPermissions,
  getPermissions,
  updatePermissions,
} from '@utils/Storage/permissions';
import store from '@store/appStore';
import {isUserBlocked} from '@utils/Storage/blockUsers';
import {deleteAllMessagesInChat} from '@utils/Storage/messages';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import {getProfileInfo} from '@utils/Profile';
import {DEFAULT_NAME} from '@configs/constants';
import {setRemoteNotificationPermissionsForChats} from '@utils/Notifications';
import {LineData, LineDataEntry} from '@utils/Storage/DBCalls/lines';
import {ContactEntry, ContactInfo} from '@utils/Storage/DBCalls/contacts';
import {
  addContact,
  deleteContact,
  getContact,
  updateContact,
} from '@utils/Storage/contacts';
import {generateRandomHexId} from '@utils/IdGenerator';
import {
  deleteContactPortsAssociatedWithContact,
  getContactPortTicket,
} from '@utils/Storage/contactPorts';

/**
 * Describes data associated with direct chats
 */
export type LineDataAttributes = LineData & ContactInfo;
export type LineDataCombined = LineDataEntry & ContactEntry;

/**
 * Intro message received by the port generator after a successful port use.
 */
export interface IntroMessage {
  pubkey: string;
  encryptedSecretContent: string;
}

/**
 * Decrypted version of intro message secret content.
 */
interface PlaintextSecretContent {
  rad: string;
  name: string;
  ticket?: string | null;
}

/**
 * Main class responsible for actions with respect to Direct chats (also called "lines")
 */
class DirectChat {
  private chatId: string | null;
  private chatData: LineDataCombined | null;
  private cryptoDriver: CryptoDriver | null;
  constructor(chatId: string | null = null) {
    this.chatId = chatId;
    this.chatData = null;
    this.cryptoDriver = null;
  }

  /**
   * Ensure chat Id is provided.
   * @throws - error if chat Id not provided.
   */
  private checkChatIdNotNull(): string {
    if (this.chatId) {
      return this.chatId;
    }
    throw new Error('NullChatId');
  }

  /**
   * Ensure chat data is loaded.
   * @throws - error if chat data has not loaded.
   */
  private checkChatDataNotNull(): LineDataCombined {
    if (this.chatData) {
      return this.chatData;
    }
    throw new Error('NullChatData');
  }

  /**
   * Load chat data associated with line.
   */
  private async loadChatData() {
    this.chatId = this.checkChatIdNotNull();
    //get connection attributes associated with chat Id
    const connection = await getBasicConnectionInfo(this.chatId);
    //use pairHash and routingId to get relevant data associated with a line.
    const lineInfo = await storage.readLineData(connection.routingId);
    const contactInfo = await getContact(connection.pairHash);
    //combine all data sources.
    this.chatData = {...lineInfo, ...contactInfo};
  }

  /**
   * Set notification state for the chat.
   */
  private async setRemoteNotificationPermission() {
    await this.loadChatData();
    this.chatData = this.checkChatDataNotNull();
    // Attempt to make API call to set the notifications permission
    const notificationState = (await this.getPermissions()).notifications;
    try {
      await setRemoteNotificationPermissionsForChats(notificationState, [
        {id: this.chatData.lineId, type: 'line'},
      ]);
    } catch (e) {
      console.error(
        '[PERMISSIONS ON CREATION] Could not make API call to set notification permissions',
        e,
      );
      // Best effort, so don't propagate errors
    }
  }

  /**
   * Chat creation on the port generator's side.
   * This side receives the routing Id (or "line Id") and pairHash from the backend
   * after a port is used by another user.
   */

  /**
   * Chat creation on the port generator's side.
   * This side receives the routing Id (or "line Id") and pairHash from the backend
   * after a port is used by another user.
   * @param lineId
   * @param data
   * @param pairHash
   * @param introMessage
   */
  public async createChatUsingLineId(
    lineId: string,
    portId: string,
    data: LineDataAttributes,
    introMessage: IntroMessage,
    pairHash: string,
    folderId: string,
    verifyTicket: boolean = false,
  ) {
    console.log(
      "[lineId and pairHash used for chat creation on contact port generator's side]: ",
      lineId,
      pairHash,
    );
    //There is no reason to for retrying this process.
    //Thus, We don't need to propogate errors.
    //Let chat creation here fail silently.
    try {
      //If intro message or pairHash are missing, don't form a chat.
      if (!introMessage || !pairHash || pairHash === '') {
        throw new Error('MissingIntroMessageOrPairHash');
      }
      //If user has been blocked, don't form a chat.
      const isBlocked = await isUserBlocked(pairHash);
      if (isBlocked) {
        throw new Error('UserIsBlocked');
      }
      //If a connection already exists for the pair Hash, check disconnection state.
      const existingChatId = await getChatIdFromPairHash(pairHash);
      if (existingChatId) {
        console.log(
          "[Existing chatId found for pairHash on port generator's side]: ",
          existingChatId,
        );
        const existingConnection = await getBasicConnectionInfo(existingChatId);
        const lineData = await storage.readLineData(
          existingConnection.routingId,
        );
        //If chat is connected, don't form a chat
        if (!lineData.disconnected) {
          throw new Error('ConnectionAlreadyExists');
        }
        //If chat is disconnected, replace old disconnected chat with new chat
        console.log("[Existing chat is disconnected port generator's side]");
        //verify intro message
        await this.verifyIntroMessage(
          introMessage,
          data.cryptoId,
          portId,
          verifyTicket,
        );
        //if verification succeeds, add a chat.
        const newLineData: LineDataCombined = {
          lineId: lineId,
          pairHash: pairHash,
          ...data,
          authenticated: true,
          disconnected: false,
        };
        //add line
        await storage.addLine(newLineData);
        //update existing connection
        await updateConnectionOnNewMessage({
          chatId: existingChatId,
          routingId: lineId,
        });
        //clean delete old line
        await this.cleanDeleteLine(lineData.lineId);
        //load up new values of line info.
        this.chatId = existingChatId;
        await this.loadChatData();
        this.chatData = this.checkChatDataNotNull();
        //set initial notification state.
        await this.setRemoteNotificationPermission();
      }
      //If a connection does not exist, form a new chat
      else {
        console.log('[Existing chat not found for pair hash]');
        //verify intro message
        const plaintextSecret = await this.verifyIntroMessage(
          introMessage,
          data.cryptoId,
          portId,
          verifyTicket,
        );
        //if verification succeeds, add a chat.
        const lineData: LineDataCombined = {
          lineId: lineId,
          pairHash: pairHash,
          ...data,
          authenticated: true,
          disconnected: false,
        };
        //add line
        await storage.addLine(lineData);
        //add a contact
        await addContact(lineData);
        //create 32 character chat Id.
        const chatId = generateRandomHexId();
        await addConnection({
          chatId: chatId,
          connectionType: ChatType.direct,
          recentMessageType: ContentType.newChat,
          readStatus: MessageStatus.latest,
          timestamp: generateISOTimeStamp(),
          newMessageCount: 0,
          folderId: folderId,
          pairHash: pairHash,
          routingId: lineId,
        });
        this.chatId = chatId;
        await this.loadChatData();
        this.chatData = this.checkChatDataNotNull();
        //set initial notification state. we don't need to await on this.
        this.setRemoteNotificationPermission();
        //update the name only if not already set.
        if (
          !this.chatData.name ||
          this.chatData.name === '' ||
          this.chatData.name === DEFAULT_NAME
        ) {
          await this.updateName(plaintextSecret.name);
        }
      }
    } catch (error) {
      console.log('[Error in chat creation using line Id]: ', error);
      //if chat creation fails, attempt delete any residuals.
      //if chat creation fails, attempt to send a disconnect request.
      try {
        await this.cleanDeleteLine(lineId, data);
        //we don't need to await on this.
        this.disconnect(lineId);
      } catch (error) {
        console.log('Unable to send disconnection request: ', error);
      }
    }
  }

  /**
   * Chat creation on port reader's side.
   * This side sends the intro message to the port generator
   * on successfully creating a lineId from portId.
   * @param portId - aka portId
   * @param data
   * @param isSuperport - whether the port is a superport
   */
  public async createChatUsingPortId(
    portId: string,
    data: LineDataAttributes,
    folderId: string,
    isSuperport: boolean = false,
    ticket: string | null = null,
  ) {
    //these api errors need to propagate as there is a potential for retrying..
    const {lineId, pairHash} = isSuperport
      ? await API.newDirectChatFromSuperport(
          portId,
          await this.generateIntroMessage(data.cryptoId),
        )
      : ticket
      ? await API.newDirectChatFromContactPort(
          portId,
          await this.generateIntroMessage(data.cryptoId, ticket),
          ticket,
        )
      : await API.newDirectChatFromPort(
          portId,
          await this.generateIntroMessage(data.cryptoId),
        );
    console.log(
      '[lineId and pairHash returned on chat creation]: ',
      lineId,
      pairHash,
    );
    try {
      //If user has been blocked, don't form a chat.
      const isBlocked = await isUserBlocked(pairHash);
      if (isBlocked) {
        throw new Error('UserIsBlocked');
      }
      //If a connection already exists for the pair Hash, check disconnection state.
      const existingChatId = await getChatIdFromPairHash(pairHash);
      if (existingChatId) {
        console.log('[Existing chatId found for pairHash]: ', existingChatId);
        const existingConnection = await getBasicConnectionInfo(existingChatId);
        const lineData = await storage.readLineData(
          existingConnection.routingId,
        );
        //If chat is connected, don't form a chat
        if (!lineData.disconnected) {
          throw new Error('ConnectionAlreadyExists');
        }
        //If chat is disconnected, replace old disconnected chat with new chat
        console.log("[Existing chat is disconnected port reader's side]");
        const newLineData: LineDataCombined = {
          lineId: lineId,
          pairHash: pairHash,
          ...data,
          authenticated: true,
          disconnected: false,
        };
        //add line
        await storage.addLine(newLineData);
        //update existing connection
        await updateConnectionOnNewMessage({
          chatId: existingChatId,
          routingId: lineId,
        });
        //clean delete old line
        await this.cleanDeleteLine(lineData.lineId);
        //load up new values of line info.
        this.chatId = existingChatId;
        await this.loadChatData();
        this.chatData = this.checkChatDataNotNull();
        //set initial notification state.
        await this.setRemoteNotificationPermission();
      }
      //If a connection does not exist, form a new chat
      else {
        console.log('[Existing chatId not found for pairHash]');
        const lineData: LineDataCombined = {
          lineId: lineId,
          pairHash: pairHash,
          ...data,
          authenticated: true,
          disconnected: false,
        };
        //add line
        await storage.addLine(lineData);
        //add a contact
        await addContact(lineData);
        //create 32 character chat Id.
        const chatId = generateRandomHexId();
        await addConnection({
          chatId: chatId,
          connectionType: ChatType.direct,
          recentMessageType: ContentType.newChat,
          readStatus: MessageStatus.latest,
          timestamp: generateISOTimeStamp(),
          newMessageCount: 0,
          folderId: folderId,
          pairHash: pairHash,
          routingId: lineId,
        });
        this.chatId = chatId;
        await this.loadChatData();
        this.chatData = this.checkChatDataNotNull();
        //set initial notification state.
        await this.setRemoteNotificationPermission();
      }
    } catch (error) {
      console.log('[Error in chat creation using port Id]: ', error);
      //if chat creation fails, attempt to send a disconnect request.
      try {
        await this.cleanDeleteLine(lineId, data);
        await this.disconnect(lineId);
      } catch (error) {
        console.log('Unable to send disconnection request: ', error);
      }
    }
  }

  /**
   * Generate an introductory message for the initiatior of a chat,
   * that is the person who created the link
   * @returns an introductory message
   */
  private async generateIntroMessage(
    cryptoId: string,
    ticket: string | null = null,
  ): Promise<IntroMessage> {
    const name = (await getProfileInfo())?.name || DEFAULT_NAME;
    const cryptoDriver = new CryptoDriver(cryptoId);
    const rad = await cryptoDriver.getRad();
    const plaintextSecret: PlaintextSecretContent = {
      name,
      rad,
      ticket: ticket ? ticket : undefined,
    };
    const encryptedSecretContent = await cryptoDriver.encrypt(
      JSON.stringify(plaintextSecret),
    );
    return {pubkey: await cryptoDriver.getPublicKey(), encryptedSecretContent};
  }

  /**
   * As the person who initiated a connection, verify a peer's introductory
   * message to determine their authenticity
   * @param intro an introductory message, used to verify a peer
   */
  private async verifyIntroMessage(
    intro: IntroMessage,
    cryptoId: string,
    contactPortId: string,
    verifyTicket: boolean = false,
  ): Promise<PlaintextSecretContent> {
    const cryptoDriver = await this.getCryptoDriver(cryptoId);
    await cryptoDriver.updateSharedSecret(intro.pubkey);
    const plaintextSecret = JSON.parse(
      await cryptoDriver.decrypt(intro.encryptedSecretContent),
    ) as PlaintextSecretContent;
    if (!((await cryptoDriver.getRad()) === plaintextSecret.rad)) {
      throw new Error('[INTRO MESSAGE VERIFICATION FAILED]');
    }
    if (verifyTicket) {
      if (!plaintextSecret.ticket) {
        throw new Error('[TICKET VALIDATION FAILED DUE TO MISSING TICKET]');
      }
      const storedTicket = await getContactPortTicket(
        contactPortId,
        plaintextSecret.ticket,
      );
      if (!storedTicket) {
        throw new Error(
          '[TICKET VALIDATION FAILED DUE TO MISSING TICKET IN STORAGE]',
        );
      } else {
        if (!storedTicket.active) {
          throw new Error(
            '[TICKET VALIDATION FAILED DUE TO EXPIRED TICKET IN STORAGE]',
          );
        }
      }
    }
    return plaintextSecret;
  }

  public getChatId(): string {
    return this.checkChatIdNotNull();
  }
  public async getChatData(): Promise<LineDataCombined> {
    await this.loadChatData();
    this.chatData = this.checkChatDataNotNull();
    return this.chatData;
  }
  public async getCryptoId(): Promise<string> {
    await this.loadChatData();
    this.chatData = this.checkChatDataNotNull();
    return this.chatData.cryptoId;
  }

  /**
   * Get the crypto driver associated with this chat
   */
  async getCryptoDriver(cryptoId?: string): Promise<CryptoDriver> {
    if (this.cryptoDriver) {
      return this.cryptoDriver;
    }
    if (cryptoId) {
      this.cryptoDriver = new CryptoDriver(cryptoId);
      return this.cryptoDriver;
    } else {
      this.cryptoDriver = new CryptoDriver(await this.getCryptoId());
      return this.cryptoDriver;
    }
  }

  /**
   * Get permissions associated with a chat.
   * @returns
   */
  public async getPermissions(): Promise<DirectPermissions> {
    try {
      await this.loadChatData();
      this.chatData = this.checkChatDataNotNull();
    } catch (error) {
      console.error('Error loading chat data: ', error);
    }
    const permissions = await getPermissions(this.chatData?.permissionsId);
    return permissions as DirectPermissions;
  }

  /**
   * Update the permissions associated with a chat.
   * @param update - permissions
   */
  public async updatePermissions(update: Permissions) {
    try {
      await this.loadChatData();
      this.chatData = this.checkChatDataNotNull();
      await updatePermissions(this.chatData.permissionsId, update);
    } catch (error) {
      console.error('Error updating permissions: ', error);
    }
  }

  /**
   * Update the contact's name
   * @param newName
   */
  public async updateName(newName: string) {
    try {
      await this.loadChatData();
      this.chatData = this.checkChatDataNotNull();
      await updateContact(this.chatData.pairHash, {name: newName});
    } catch (error) {
      console.error('Error updating name: ', error);
    }
  }

  /**
   * Update the contact's display picture
   * @param displayPic
   */
  public async updateDisplayPic(displayPic: string) {
    try {
      await this.loadChatData();
      this.chatData = this.checkChatDataNotNull();
      await updateContact(this.chatData.pairHash, {displayPic: displayPic});
    } catch (error) {
      console.error('Error updating display picture: ', error);
    }
  }

  /**
   * Mark chat as authenticated.
   */
  public async toggleAuthenticated() {
    await this.loadChatData();
    this.chatData = this.checkChatDataNotNull();
    await storage.updateLine(this.chatData.lineId, {authenticated: true});
    console.log('[TOGGLING AUTHENTICATED]');
    // Ping to re-render
    store.dispatch({
      type: 'PING',
      payload: 'PONG',
    });
  }

  /**
   * Disconnect a chat
   * @param lineId - line being disconnected.
   * @param onlyLocal - whether API call should be skipped.
   */
  public async disconnect(lineId?: string, onlyLocal: boolean = false) {
    if (lineId) {
      if (!onlyLocal) {
        await API.disconnectChat(lineId);
      }
      const lineData = await storage.getLineData(lineId);
      //update storage and delete contact port
      if (lineData) {
        await storage.updateLine(lineId, {disconnected: true});
        const chatId = await getChatIdFromRoutingId(lineId);
        if (chatId) {
          const connection = await getBasicConnectionInfo(chatId);
          await deleteContactPortsAssociatedWithContact(connection.pairHash);
        }
      }
    } else {
      await this.loadChatData();
      this.chatData = this.checkChatDataNotNull();
      if (!onlyLocal) {
        await API.disconnectChat(this.chatData.lineId);
      }
      const lineData = await storage.getLineData(this.chatData.lineId);
      //update storage and delete contact port
      if (lineData) {
        await storage.updateLine(this.chatData.lineId, {disconnected: true});
        const chatId = await getChatIdFromRoutingId(this.chatData.lineId);
        if (chatId) {
          const connection = await getBasicConnectionInfo(chatId);
          await deleteContactPortsAssociatedWithContact(connection.pairHash);
        }
      }
    }
  }

  /**
   * Deletes a line and associated crypto and permissions data.
   * @param lineId - line to be deleted.
   */
  private async cleanDeleteLine(
    lineId: string,
    data: LineDataAttributes | null = null,
  ) {
    try {
      const lineData = data || (await storage.readLineData(lineId));
      await storage.deleteLine(lineId);
      const cryptoDriver = new CryptoDriver(lineData.cryptoId);
      await cryptoDriver.deleteCryptoData();
      await clearPermissions(lineData.permissionsId);
    } catch (error) {
      console.log('Error deleting line data: ', error);
    }
  }

  /**
   * Fully delete a chat.
   * Only works if the chat is already disconnected.
   */
  public async delete() {
    this.chatId = this.checkChatIdNotNull();
    await this.loadChatData();
    this.chatData = this.checkChatDataNotNull();
    //delete all message data
    await deleteAllMessagesInChat(this.chatId);
    //delete line and associated data
    await this.cleanDeleteLine(this.chatData.lineId);
    //delete connection
    await deleteConnection(this.chatId);
    //delete contact. this only succeeds if there are no other references to the contact.
    await deleteContact(this.chatData.pairHash);
  }
}

export default DirectChat;
