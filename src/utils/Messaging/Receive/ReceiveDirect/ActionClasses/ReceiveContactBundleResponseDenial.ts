// in case of receiving contact bundle denial as a response

import DirectReceiveAction from '../DirectReceiveAction';
import {handleContactShareDenial} from '@utils/ContactSharing';

class ReceiveContactBundleResponseDenial extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();

    await handleContactShareDenial(this.chatId);
  }
}

export default ReceiveContactBundleResponseDenial;
