// this is to receieve the final contact bundle
import {ContactPortBundleParams} from '@utils/Messaging/interfaces';
import {acceptAuthorizedContactBundle} from '@utils/Ports/contactport';

import DirectReceiveAction from '../DirectReceiveAction';

class ReceiveContactPortBundle extends DirectReceiveAction {
  generatePreviewText(): string {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    return '';
  }

  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    await this.doubleProcessingGuard();
    //save message to storage
    await this.saveMessage();
    //save contact port bundle to accepted contact ports
    const bundle = (
      this.decryptedMessageContent.data as ContactPortBundleParams
    ).bundle;
    if (bundle) {
      await acceptAuthorizedContactBundle(bundle, this.chatId);
    }
  }
}

export default ReceiveContactPortBundle;
