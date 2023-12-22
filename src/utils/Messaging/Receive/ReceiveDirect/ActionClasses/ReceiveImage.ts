import {LargeDataParams} from '@utils/Messaging/interfaces';
import ReceiveLargeData from './ReceiveLargeData';

class ReceiveImage extends ReceiveLargeData {
  generatePreviewText(): string {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    return (
      (this.decryptedMessageContent.data as LargeDataParams).text ||
      'received image: ' +
        (this.decryptedMessageContent.data as LargeDataParams).fileName
    );
  }
}

export default ReceiveImage;
