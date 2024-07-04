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
import {ChatType} from '@utils/Connections/interfaces';
import {ContentType, MessageStatus} from '@utils/Messaging/interfaces';
import {generateISOTimeStamp} from '@utils/Time';
import {
  DirectPermissions,
  Permissions,
} from '@utils/ChatPermissions/interfaces';
import {getPermissions, updatePermissions} from '@utils/Storage/permissions';
import store from '@store/appStore';
import {isUserBlocked} from '@utils/UserBlocking';
import {deleteAllMessagesInChat} from '@utils/Storage/messages';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import {getProfileInfo} from '@utils/Profile';
import {DEFAULT_NAME} from '@configs/constants';

class DirectChat {
  private chatId: string | null;
  private chatData: LineDataStrict | null;
  private cryptoDriver: CryptoDriver | null;
  constructor(chatId: string | null = null) {
    this.chatId = chatId;
    this.chatData = null;
    this.cryptoDriver = null;
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
    folderId: string,
    linkId: string | null = null,
    lineId: string | null = null,
    isSuperport: boolean = false,
    pairHash: string | null = null,
    introMessage: IntroMessage | null = null,
  ) {
    if (lineId) {
      // If I created the bundle
      if (!introMessage) {
        // require an intro message
        return;
      }
      this.chatId = lineId;
      const isBlocked = await isUserBlocked(pairHash || '');
      if (isBlocked) {
        await this.disconnect();

        return;
      }
      await storage.newLine(this.chatId);
      update.pairHash = pairHash;
      await storage.updateLine(this.chatId, update);
      await this.verifyIntroMessage(introMessage);
    } else if (linkId) {
      // If I read a bundle
      const {chatId, pairHash} = isSuperport
        ? await API.newDirectChatFromSuperport(
            linkId,
            await this.generateIntroMessage(update.cryptoId),
          )
        : await API.newDirectChatFromPort(
            linkId,
            await this.generateIntroMessage(update.cryptoId),
          );
      this.chatId = chatId;
      const isBlocked = await isUserBlocked(pairHash);
      if (isBlocked) {
        await this.disconnect();
        return;
      }
      await storage.newLine(chatId);
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
      readStatus: MessageStatus.latest,
      timestamp: generateISOTimeStamp(),
      newMessageCount: 0,
      disconnected: false,
      authenticated: false,
      folderId: folderId,
    });
    await this.toggleAuthenticated();
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

  async getCryptoDriver(): Promise<CryptoDriver> {
    if (this.cryptoDriver) {
      return this.cryptoDriver;
    }
    return new CryptoDriver(await this.getCryptoId());
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
    const chatId = this.checkChatIdNotNull();
    await API.disconnectChat(chatId);
    await this.updateChatData({disconnected: true});
    await setConnectionDisconnected(chatId);
  }

  public async delete() {
    this.chatId = this.checkChatIdNotNull();
    await deleteAllMessagesInChat(this.chatId);
    await storage.deleteLine(this.chatId);
    await deleteConnection(this.chatId);
  }

  /**
   * Generate an introductory message for the initiatior of a chat,
   * that is the person who created the link
   * @returns an introductory message
   */
  async generateIntroMessage(cryptoId: string): Promise<IntroMessage> {
    const name = (await getProfileInfo())?.name || DEFAULT_NAME;
    const cryptoDriver = new CryptoDriver(cryptoId);
    const rad = await cryptoDriver.getRad();
    const plaintextSecret: PlaintextSecretContent = {
      name,
      rad,
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
  public async verifyIntroMessage(intro: IntroMessage): Promise<void> {
    await this.loadChatData();
    this.chatData = await this.checkChatDataNotNull();
    const cryptoDriver = await this.getCryptoDriver();
    await cryptoDriver.updateSharedSecret(intro.pubkey);
    const plaintextSecret = JSON.parse(
      await cryptoDriver.decrypt(intro.encryptedSecretContent),
    ) as PlaintextSecretContent;
    if ((await cryptoDriver.getRad()) === plaintextSecret.rad) {
      await this.toggleAuthenticated();
      //update the name only if not already set.
      if (
        !this.chatData.name ||
        this.chatData.name === '' ||
        this.chatData.name === DEFAULT_NAME
      ) {
        await this.updateName(plaintextSecret.name);
      }
    }
  }
}

export interface IntroMessage {
  pubkey: string;
  encryptedSecretContent: string;
}

interface PlaintextSecretContent {
  rad: string;
  name: string;
}

export default DirectChat;
