import CryptoDriver from '@utils/Crypto/CryptoDriver';
import { ContactPort } from '@utils/Ports/ContactPorts/ContactPort';
import {
  deleteConnection,
  getBasicConnectionInfo,
  getChatIdFromRoutingId,
} from '@utils/Storage/connections';
import {
  deleteContact,
  getContact,
  updateContact,
} from '@utils/Storage/contacts';
import { ContactEntry } from '@utils/Storage/DBCalls/contacts';
import { LineDataEntry } from '@utils/Storage/DBCalls/lines';
import {
  DirectPermissions,
} from '@utils/Storage/DBCalls/permissions/interfaces';
import * as storage from '@utils/Storage/lines';
import { deleteAllMessagesInChat } from '@utils/Storage/messages';
import {
  clearPermissions,
  getPermissions,
} from '@utils/Storage/permissions';

import * as API from './APICalls';

/**
 * Combines line data and contact data.
 */
export type LineDataCombined = LineDataEntry & ContactEntry;

/**
 * Main class responsible for actions with respect to Direct chats (also called "lines")
 */
class DirectChat {
  private chatId: string;
  private chatData: LineDataCombined | null;
  private cryptoDriver: CryptoDriver | null;

  constructor(chatId: string) {
    this.chatId = chatId;
    this.chatData = null;
    this.cryptoDriver = null;
  }

  /**
   * Cleans up a line and associated data.
   * Note that this method deos not delete any associated connection or contact.
   * Please use only when you are sure that associated connection has been deleted.
   * @param lineId - line to be cleaned up.
   * @param data - line data.
   */
  static async cleanDeleteLine(lineId: string, data: LineDataEntry | null = null) {
    try {
      const lineData = data || (await storage.readLineData(lineId));
      await storage.deleteLine(lineId);
      if (lineData.cryptoId) {
        const cryptoDriver = new CryptoDriver(lineData.cryptoId);
        await cryptoDriver.deleteCryptoData();
      }
      if (lineData.permissionsId) {
        await clearPermissions(lineData.permissionsId);
      }
    } catch (error) {
      console.log('Error cleaning up line: ', error);
    }
  }

  /**
   * Disconnects a line and deletes the contact port.
   * @param lineId - line to be disconnected.
   * @param onlyLocal - whether API call should be skipped.
   */
  static async cleanDisconnectLine(lineId: string, onlyLocal: boolean = false) {
    try {
      if (!onlyLocal) {
        await API.disconnectChat(lineId);
      }
      await storage.updateLine(lineId, { disconnected: true });
      const chatId = await getChatIdFromRoutingId(lineId);
      if (chatId) {
        const connection = await getBasicConnectionInfo(chatId);
        const contactPort = await ContactPort.generator.shared.fromPairHash(connection.pairHash);
        await contactPort.clean();
      }
    } catch (error) {
      console.error('Error in cleanly disconnecting line: ', error);
    }
  }

  /**
   * Informs the server of a disconnection.
   * @param lineId - line to be disconnected.
   */
  static async informServerOfDisconnection(lineId: string) {
    try {
      await API.disconnectChat(lineId);
    } catch (error) {
      console.error('Error informing server of disconnection: ', error);
    }
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
    this.chatData = { ...lineInfo, ...contactInfo };
  }

  /**
   * Get the chat id
   * @returns
   */
  public getChatId(): string {
    return this.checkChatIdNotNull();
  }

  /**
   * Get the chat data
   * @returns
   */
  public async getChatData(): Promise<LineDataCombined> {
    await this.loadChatData();
    this.chatData = this.checkChatDataNotNull();
    return this.chatData;
  }

  /**
   * Get the crypto id
   * @returns
   */
  public async getCryptoId(): Promise<string> {
    await this.loadChatData();
    this.chatData = this.checkChatDataNotNull();
    return this.chatData.cryptoId;
  }

  /**
   * Get the crypto driver associated with this chat
   */
  async getCryptoDriver(): Promise<CryptoDriver> {
    if (this.cryptoDriver) {
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
   * Update the contact's name
   * @param newName
   */
  public async updateName(newName: string) {
    try {
      await this.loadChatData();
      this.chatData = this.checkChatDataNotNull();
      await updateContact(this.chatData.pairHash, { name: newName });
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
      await updateContact(this.chatData.pairHash, { displayPic: displayPic });
    } catch (error) {
      console.error('Error updating display picture: ', error);
    }
  }

  /**
   * Disconnect a chat
   * @param onlyLocal - whether API call should be skipped.
   */
  public async disconnect(onlyLocal: boolean = false) {
    await this.loadChatData();
    this.chatData = this.checkChatDataNotNull();
    await DirectChat.cleanDisconnectLine(this.chatData.lineId, onlyLocal);
  }

  /**
   * Fully delete a chat.
   * Only works if the chat is already disconnected.
   */
  public async delete() {
    this.chatId = this.checkChatIdNotNull();
    await this.loadChatData();
    this.chatData = this.checkChatDataNotNull();
    if (this.chatData.disconnected) {
      //delete all message data
      await deleteAllMessagesInChat(this.chatId);
      //delete line and associated data
      await DirectChat.cleanDeleteLine(this.chatData.lineId);
      //delete connection
      await deleteConnection(this.chatId);
      //delete contact. this only succeeds if there are no other references to the contact.
      await deleteContact(this.chatData.pairHash);
    } else {
      throw new Error('ChatNotDisconnected');
    }
  }
}

export default DirectChat;
