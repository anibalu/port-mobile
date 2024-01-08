import {LineData, LineDataStrict} from './interfaces';
import * as storage from '@utils/Storage/line';
import * as API from './APICalls';
import {
  addConnection,
  deleteConnection,
  setConnectionDisconnected,
  toggleConnectionAuthenticated,
  updateConnectionDisplayPic,
  updateConnectionName,
} from '@utils/Connections';
import {ChatType, ReadStatus} from '@utils/Connections/interfaces';
import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';
import {generateISOTimeStamp} from '@utils/Time';
import {createChatPermissions} from '@utils/ChatPermissions';
import {generateRandomHexId} from '@utils/IdGenerator';
import {saveMessage} from '@utils/Storage/messages';

class DirectChat {
  private chatId: string | null;
  private chatData: LineDataStrict | null;
  constructor(chatId: string | null = null) {
    this.chatId = chatId;
    this.chatData = null;
  }
  private checkChatIdNotNull(): string {
    if (this.chatId) {
      return this.chatId;
    }
    throw new Error('NullChatId');
  }
  private checkChatDataNotNull(): LineDataStrict {
    if (this.chatData) {
      return this.chatData;
    }
    throw new Error('NullChatData');
  }
  private async loadChatData() {
    this.chatId = this.checkChatIdNotNull();
    const newChatData = await storage.readLineData(this.chatId);
    if (!newChatData) {
      throw new Error('NullChatData');
    }
    this.chatData = newChatData;
  }
  public async createChat(
    update: LineDataStrict,
    linkId: string | null = null,
    lineId: string | null = null,
    isSuperport: boolean = false,
    permissionPresetId: string | null = null,
    channel: string | null = null,
  ) {
    const newUpdate = isSuperport
      ? {...update, connectedUsing: 'superport://' + linkId}
      : {...update, connectedUsing: channel};
    if (lineId) {
      const newChatId = lineId;
      await storage.newLine(newChatId);
      this.chatId = newChatId;
      await storage.updateLine(this.chatId, newUpdate);
      await this.loadChatData();
    } else if (linkId) {
      const newChatId = isSuperport
        ? await API.newDirectChatFromSuperport(linkId)
        : await API.newDirectChatFromPort(linkId);
      await storage.newLine(newChatId);
      this.chatId = newChatId;
      await storage.updateLine(this.chatId, newUpdate);
      await this.loadChatData();
    }
    this.chatId = this.checkChatIdNotNull();
    this.chatData = this.checkChatDataNotNull();
    await createChatPermissions(
      this.chatId,
      ChatType.direct,
      permissionPresetId,
    );
    await addConnection({
      chatId: this.chatId,
      connectionType: ChatType.direct,
      name: this.chatData.name,
      recentMessageType: ContentType.newChat,
      readStatus: ReadStatus.new,
      timestamp: generateISOTimeStamp(),
      newMessageCount: 0,
      disconnected: false,
      authenticated: false,
    });
  }
  public getChatId(): string {
    return this.checkChatIdNotNull();
  }
  public async getChatData(): Promise<LineDataStrict> {
    await this.loadChatData();
    this.chatData = this.checkChatDataNotNull();
    return this.chatData;
  }
  public async getCryptoId(): Promise<string> {
    await this.loadChatData();
    this.chatData = this.checkChatDataNotNull();
    return this.chatData.cryptoId;
  }
  public async updateChatData(update: LineData) {
    this.chatId = this.checkChatIdNotNull();
    await storage.updateLine(this.chatId, update);
    await this.loadChatData();
  }
  public async updateName(newName: string) {
    this.chatId = this.checkChatIdNotNull();
    await this.updateChatData({name: newName});
    await updateConnectionName(this.chatId, newName);
  }
  public async updateDisplayPic(displayPic: string) {
    this.chatId = this.checkChatIdNotNull();
    await this.updateChatData({displayPic: displayPic});
    await updateConnectionDisplayPic(this.chatId, displayPic);
  }
  public async toggleAuthenticated() {
    this.chatId = this.checkChatIdNotNull();
    this.chatData = this.checkChatDataNotNull();
    const savedMessage: SavedMessageParams = {
      messageId: generateRandomHexId(),
      contentType: ContentType.info,
      data: {
        info: 'This chat is now end-to-end encrypted',
      },
      chatId: this.chatId,
      sender: true,
      timestamp: generateISOTimeStamp(),
    };
    await saveMessage(savedMessage);
    await this.updateChatData({authenticated: true});
    await toggleConnectionAuthenticated(this.chatId);
  }
  public async didConnectUsingSuperport(): Promise<string | null> {
    await this.loadChatData();
    this.chatId = this.checkChatIdNotNull();
    this.chatData = this.checkChatDataNotNull();
    if (
      this.chatData.connectedUsing &&
      this.chatData.connectedUsing.substring(0, 12) === 'superport://'
    ) {
      const fromSuperport = this.chatData.connectedUsing.substring(12, 12 + 32);
      if (fromSuperport.length === 32) {
        return fromSuperport;
      }
    }
    return null;
  }
  public async didConnectUsingContactSharing(): Promise<string | null> {
    await this.loadChatData();
    this.chatId = this.checkChatIdNotNull();
    this.chatData = this.checkChatDataNotNull();
    if (
      this.chatData.connectedUsing &&
      this.chatData.connectedUsing.substring(0, 9) === 'shared://'
    ) {
      const fromChatId = this.chatData.connectedUsing.substring(9, 9 + 32);
      if (fromChatId.length === 32) {
        return fromChatId;
      }
    }
    return null;
  }
  public async disconnect() {
    this.chatId = this.checkChatIdNotNull();
    const didDisconnect = await API.disconnectChat(this.chatId);
    await this.updateChatData({disconnected: true});
    await setConnectionDisconnected(this.chatId);
    return didDisconnect;
  }
  public async delete() {
    this.chatId = this.checkChatIdNotNull();
    await storage.deleteLine(this.chatId);
    await deleteConnection(this.chatId);
  }
}

export default DirectChat;
