import CryptoDriver from '@utils/Crypto/CryptoDriver';
import Group from '@utils/Groups/Group';
import {PayloadMessageParams} from '@utils/Messaging/interfaces';
import GroupReceiveAction from './GroupReceiveAction';
import {groupReceiveActionPicker} from './possibleActions';

class ReceiveGroupMessage {
  private message: any;
  private chatId: string;
  private receiveTime: string;
  private senderId: string | null;
  private receiveClass: GroupReceiveAction | null;
  private decryptedMessageContent: PayloadMessageParams | null;
  private content: any;
  //construct the class
  constructor(
    chatId: string,
    senderId: string | null,
    message: any,
    receiveTime: string,
  ) {
    this.message = message;
    this.receiveTime = receiveTime;
    this.chatId = chatId;
    this.receiveClass = null;
    this.senderId = senderId;
    this.decryptedMessageContent = null;
  }
  //make sure sender id isn't null
  private senderIdNotNullRule(): string {
    if (!this.senderId) {
      throw new Error('NullSenderId');
    }
    return this.senderId as string;
  }
  private extractContent(): void {
    try {
      if (!this.message.content) {
        this.content = null;
        return;
      }
      this.content = this.message.messageContent;
    } catch (error) {
      console.log('Error in extracting message content: ', error);
      this.content = null;
    }
  }
  private async extractDecryptedMessageContent(): Promise<void> {
    try {
      if (!this.message.content) {
        this.decryptedMessageContent = null;
        return;
      } else {
        if (this.content.encryptedContent && this.senderId) {
          const group = new Group(this.chatId);

          const member = await group.getMember(this.senderId);

          const cryptoDriver = new CryptoDriver(member!.cryptoId);

          const decryptedAndProcessed = JSON.parse(
            await cryptoDriver.decrypt(this.content.encryptedContent),
          );

          this.decryptedMessageContent =
            decryptedAndProcessed as PayloadMessageParams;
        } else {
          this.decryptedMessageContent = this.content as PayloadMessageParams;
        }
      }
    } catch (error) {
      console.log('Error in extracting decrypted message content: ', error);
      this.decryptedMessageContent = null;
    }
  }
  //assign receive action
  private async assignReceiverClass() {
    this.senderId = this.senderIdNotNullRule();
    this.receiveClass = await groupReceiveActionPicker(
      this.chatId,
      this.senderId,
      this.message,
      this.receiveTime,
      this.content,
      this.decryptedMessageContent,
    );
  }
  //perform receive action
  async receive() {
    this.extractContent();
    await this.extractDecryptedMessageContent();
    await this.assignReceiverClass();
    if (this.receiveClass) {
      await this.receiveClass.performAction();
    }
  }
}

export default ReceiveGroupMessage;
