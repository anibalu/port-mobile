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
import {ContentType} from '@utils/Messaging/interfaces';
import {generateISOTimeStamp} from '@utils/Time';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {
  DirectPermissions,
  Permissions,
} from '@utils/ChatPermissions/interfaces';
import {getPermissions, updatePermissions} from '@utils/Storage/permissions';
import store from '@store/appStore';

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

    //Profile pictures can be avatars or DPs. We check and return URIs conditionally on this.
    if (newChatData?.displayPic) {
      newChatData.displayPic = newChatData?.displayPic.includes('avatar://')
        ? newChatData.displayPic
        : getSafeAbsoluteURI(newChatData.displayPic, 'doc');
    }
    if (!newChatData) {
      throw new Error('NullChatData');
    }
    this.chatData = newChatData;
  }
  public async createChat(
    update: LineDataStrict,
    folderId: string,
    linkId: string | null = null,
    lineId: string | null = null,
    isSuperport: boolean = false,
    pairHash: string | null = null,
  ) {
    if (lineId) {
      const newChatId = lineId;
      await storage.newLine(newChatId);
      this.chatId = newChatId;
      update.pairHash = pairHash;
      await storage.updateLine(this.chatId, update);
      await this.loadChatData();
    } else if (linkId) {
      const {chatId, pairHash} = isSuperport
        ? await API.newDirectChatFromSuperport(linkId)
        : await API.newDirectChatFromPort(linkId);
      await storage.newLine(chatId);
      this.chatId = chatId;
      update.pairHash = pairHash;
      await storage.updateLine(this.chatId, update);
      await this.loadChatData();
    }
    this.chatId = this.checkChatIdNotNull();
    this.chatData = this.checkChatDataNotNull();
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
      folderId: folderId,
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
  public async getPermissions(): Promise<DirectPermissions> {
    await this.loadChatData();
    this.chatData = this.checkChatDataNotNull();
    const permissions = await getPermissions(this.chatData.permissionsId);
    return permissions as DirectPermissions;
  }
  public async updatePermissions(update: Permissions) {
    await this.loadChatData();
    if (this.chatData) {
      await updatePermissions(this.chatData.permissionsId, update);
    }
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
    await this.updateChatData({authenticated: true});
    await toggleConnectionAuthenticated(this.chatId);
    console.log('[TOGGLING AUTHENTICATED]');
    // Ping to re-render
    store.dispatch({
      type: 'PING',
      payload: 'PONG',
    });
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
