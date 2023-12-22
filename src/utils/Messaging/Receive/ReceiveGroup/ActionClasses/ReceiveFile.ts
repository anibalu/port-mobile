import {LargeDataParams} from '@utils/Messaging/interfaces';
import ReceiveLargeData from './ReceiveLargeData';
import {saveToFilesDir} from '@utils/Storage/StorageRNFS/sharedFileHandlers';

class ReceiveFile extends ReceiveLargeData {
  generatePreviewText(): string {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    return (
      (this.decryptedMessageContent.data as LargeDataParams).text ||
      'received file: ' +
        (this.decryptedMessageContent.data as LargeDataParams).fileName
    );
  }
  async saveToDir(plaintext: string): Promise<string> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //save image to chat storage and update fileUri
    const fileUri = await saveToFilesDir(
      this.chatId,
      plaintext,
      (this.decryptedMessageContent.data as LargeDataParams).fileName,
    );
    return fileUri;
  }
}

export default ReceiveFile;
