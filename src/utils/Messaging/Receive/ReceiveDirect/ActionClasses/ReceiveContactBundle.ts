// this is to receieve the final contact bundle
import DirectReceiveAction from '../DirectReceiveAction';
class ReceiveContactBundle extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //save message to storage
    await this.saveMessage();
  }
}

export default ReceiveContactBundle;
