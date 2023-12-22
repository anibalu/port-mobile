import {LargeDataParams} from '@utils/Messaging/interfaces';
import ReceiveLargeData from './ReceiveLargeData';

class ReceiveVideo extends ReceiveLargeData {
  generatePreviewText(): string {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    return (
      (this.decryptedMessageContent.data as LargeDataParams).text ||
      'received video: ' +
        (this.decryptedMessageContent.data as LargeDataParams).fileName
    );
  }
}

export default ReceiveVideo;
