// this is to receieve the final contact bundle
import {ContentType} from '@utils/Messaging/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';

import DirectReceiveAction from '../DirectReceiveAction';

class ReceiveContactPortRequest extends DirectReceiveAction {
  generatePreviewText(): string {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    return '';
  }

  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    await this.doubleProcessingGuard();
    //save message to storage
    await this.saveMessage();
    //send contact port
    const sender = new SendMessage(
      this.chatId,
      ContentType.contactPortBundle,
      {},
    );
    sender.send();
  }
}

export default ReceiveContactPortRequest;
