import {PayloadMessageParams} from '@utils/Messaging/interfaces';
import DirectReceiveAction from './DirectReceiveAction';
import {directReceiveActionPicker} from './possibleActions';
import {decryptMessage} from '@utils/Crypto/aes';

class ReceiveDirectMessage {
  private message: any;
  private chatId: string;
  private receiveTime: string;
  private receiveClass: DirectReceiveAction | null;
  private decryptedMessageContent: PayloadMessageParams | null;
  //construct the class
  constructor(chatId: string, message: any, receiveTime: string) {
    this.message = message;
    this.receiveTime = receiveTime;
    this.chatId = chatId;
    this.receiveClass = null;
    this.decryptedMessageContent = null;
  }
  //decrypt encrypted message content
  private async extractDecryptedMessageContent(): Promise<void> {
    try {
      if (!this.message.messageContent) {
        this.decryptedMessageContent = null;
        return;
      }
      const decryptedAndProcessed = JSON.parse(
        await decryptMessage(this.chatId, this.message.messageContent),
      );
      this.decryptedMessageContent =
        decryptedAndProcessed as PayloadMessageParams;
    } catch (error) {
      console.log('Error in extracting decrypted message content: ', error);
      this.decryptedMessageContent = null;
    }
  }
  //assign receive action
  private async assignReceiverClass() {
    this.receiveClass = await directReceiveActionPicker(
      this.chatId,
      this.message,
      this.receiveTime,
      this.decryptedMessageContent,
    );
  }
  //perform receive action
  async receive() {
    await this.extractDecryptedMessageContent();
    await this.assignReceiverClass();
    if (this.receiveClass) {
      await this.receiveClass.performAction();
    }
  }
}

export default ReceiveDirectMessage;
