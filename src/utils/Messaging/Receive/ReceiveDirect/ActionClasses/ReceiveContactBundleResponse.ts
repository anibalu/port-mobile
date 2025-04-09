// in case of receiving contact bundle response

import {relayContactBundle} from '@utils/ContactSharing';
import {ContactBundleResponseParams} from '@utils/Messaging/interfaces';

import DirectReceiveAction from '../DirectReceiveAction';


class ReceiveContactBundleResponse extends DirectReceiveAction {
  generatePreviewText(): string {
    return '';
  }

  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    // Prevent reprocessing the same Contact bundle relay
    this.doubleProcessingGuard();
    this.saveMessage();

    const {approvedMessageId, bundle} = this.decryptedMessageContent
      .data as ContactBundleResponseParams;

    await relayContactBundle(
      this.chatId,
      bundle,
      approvedMessageId,
      this.chatId,
    );
  }
}

export default ReceiveContactBundleResponse;
