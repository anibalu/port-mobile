import {LargeDataParams} from '@utils/Messaging/interfaces';
import {getConnection, updateConnectionOnNewMessage} from '@utils/Connections';
import {downloadData} from '@utils/Messaging/largeData';
import {decryptFile} from '@utils/Crypto/aes';
import {saveToMediaDir} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {Permissions} from '@utils/ChatPermissions/interfaces';
import {ConnectionInfo, ReadStatus} from '@utils/Connections/interfaces';
import {displaySimpleNotification} from '@utils/Notifications';
import GroupReceiveAction from '../GroupReceiveAction';

class ReceiveLargeData extends GroupReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //if media Id doesn't exist, throw error.
    if (
      !(this.decryptedMessageContent.data as LargeDataParams).mediaId ||
      !(this.decryptedMessageContent.data as LargeDataParams).key
    ) {
      throw new Error('MediaIdOrKeyNull');
    }
    //get connection info
    const connection = await getConnection(this.chatId);
    //autodownload or not based on permission
    if ((connection.permissions as Permissions).autoDownload.toggled) {
      await this.autoDownloadOn();
    } else {
      await this.autoDownloadOff();
    }
    //update connection
    await this.updateConnection();
    //notify user
    this.notify(connection);
  }
  async autoDownloadOn(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //try to download media
    const mediaId =
      (this.decryptedMessageContent.data as LargeDataParams).mediaId || '';
    const key =
      (this.decryptedMessageContent.data as LargeDataParams).key || '';
    const ciphertext = await downloadData(mediaId);
    //decrypt media with key
    const plaintext = await decryptFile(ciphertext, key);
    //save media to dir
    const fileUri = await this.saveToDir(plaintext);
    //save message to storage
    await this.saveMessage({
      ...(this.decryptedMessageContent.data as LargeDataParams),
      fileUri: fileUri,
      mediaId: null,
      key: null,
    });
  }
  async autoDownloadOff(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //save message to storage
    await this.saveMessage();
  }
  generatePreviewText(): string {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    return (
      (this.decryptedMessageContent.data as LargeDataParams).text ||
      'received large data: ' +
        (this.decryptedMessageContent.data as LargeDataParams).fileName
    );
  }
  async saveToDir(plaintext: string): Promise<string> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //save image to chat storage and update fileUri
    const fileUri = await saveToMediaDir(
      this.chatId,
      plaintext,
      (this.decryptedMessageContent.data as LargeDataParams).fileName,
    );
    return fileUri;
  }
  async updateConnection(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    await updateConnectionOnNewMessage({
      chatId: this.chatId,
      readStatus: ReadStatus.new,
      recentMessageType: this.decryptedMessageContent.contentType,
      text: this.generatePreviewText(),
    });
  }
  notify(connection: ConnectionInfo): void {
    if ((connection.permissions as Permissions).notifications.toggled) {
      this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
      const notificationData = {
        title: connection.name,
        body: this.generatePreviewText(),
      };
      displaySimpleNotification(notificationData.title, notificationData.body);
    }
  }
}

export default ReceiveLargeData;
