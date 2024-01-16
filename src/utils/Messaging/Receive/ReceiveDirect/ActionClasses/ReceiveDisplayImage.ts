import DirectReceiveAction from '../DirectReceiveAction';
import {handleAsyncMediaDownload} from '../HandleMediaDownload';

class ReceiveDisplayImage extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    await this.saveMessage();
    handleAsyncMediaDownload(
      this.chatId,
      this.decryptedMessageContent.messageId,
    );
  }
}

export default ReceiveDisplayImage;
