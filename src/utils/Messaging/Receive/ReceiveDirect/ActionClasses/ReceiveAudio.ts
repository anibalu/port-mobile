import {LargeDataParams} from '@utils/Messaging/interfaces';
import ReceiveLargeData from './ReceiveLargeData';

class ReceiveAudio extends ReceiveLargeData {
  generatePreviewText(): string {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    return (
      '🔊 ' +
      ((this.decryptedMessageContent.data as LargeDataParams).text ||
        'Voice note')
    );
  }
}

export default ReceiveAudio;
