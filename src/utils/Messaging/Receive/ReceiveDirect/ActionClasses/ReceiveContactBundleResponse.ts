// in case of receiving contact bundle response

import {ContactBundleResponseParams} from '@utils/Messaging/interfaces';
import DirectReceiveAction from '../DirectReceiveAction';

import {relayContactBundle} from '@utils/ContactSharing';

class ReceiveContactBundleResponse extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();

    const {approvedMessageId, bundle, source} = this.decryptedMessageContent
      .data as ContactBundleResponseParams;

    await relayContactBundle(this.chatId, bundle, approvedMessageId, source);
  }
}

export default ReceiveContactBundleResponse;
