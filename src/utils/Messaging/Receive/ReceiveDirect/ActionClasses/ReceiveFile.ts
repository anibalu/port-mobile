import {LargeDataParams} from '@utils/Messaging/interfaces';
import ReceiveLargeData from './ReceiveLargeData';
class ReceiveFile extends ReceiveLargeData {
  generatePreviewText(): string {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    return (
      (this.decryptedMessageContent.data as LargeDataParams).text ||
      'received file: ' +
        (this.decryptedMessageContent.data as LargeDataParams).fileName
    );
  }
}

export default ReceiveFile;
