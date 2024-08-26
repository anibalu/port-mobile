// this is to receieve the final contact bundle
import DirectReceiveAction from '../DirectReceiveAction';

class ReceiveContactPortPermissionRequest extends DirectReceiveAction {
  generatePreviewText(): string {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    return '';
  }

  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    await this.doubleProcessingGuard();
    //save message to storage
    await this.saveMessage();
  }
}

export default ReceiveContactPortPermissionRequest;
