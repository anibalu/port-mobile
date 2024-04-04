import {LargeDataParams} from '@utils/Messaging/interfaces';
import ReceiveLargeData from './ReceiveLargeData';
class ReceiveFile extends ReceiveLargeData {
  generatePreviewText(): string {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    return (
      '📎 ' +
      ((this.decryptedMessageContent.data as LargeDataParams).text || 'File')
    );
  }
}

export default ReceiveFile;
