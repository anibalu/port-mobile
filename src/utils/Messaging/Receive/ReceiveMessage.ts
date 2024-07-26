import ReceiveDirectMessage from './ReceiveDirect/ReceiveDirectMessage';
import ReceiveGroupMessage from './ReceiveGroup/ReceiveGroupMessage';

class ReceiveMessage {
  private message: any;
  private chatId: string;
  private receiveTime: string;
  private isGroupMessage: boolean;
  private senderId: string | null;
  //construct the class
  constructor(messageRaw: any, receiveTime: string = new Date().toISOString()) {
    this.message = this.processRawMessage(messageRaw);
    let messageTime = receiveTime;
    try {
      if (this.message.timestamp) {
        const serverTime = new Date(this.message.timestamp).toISOString();
        messageTime = serverTime;
      }
    } catch (error) {
      console.log('Incompatible time stamp received', error);
    }
    this.receiveTime = messageTime;
    this.chatId = this.assignChatId();
    this.isGroupMessage = this.checkIfGroupMessage();
    this.senderId = this.assignSenderId();
  }
  //processes raw message
  private processRawMessage(messageRaw: any) {
    try {
      const processed = JSON.parse(messageRaw);
      return processed;
    } catch (error) {
      console.log('error processing raw message: ', error);
      return messageRaw;
    }
  }
  //assigns chatId
  private assignChatId(): string {
    return (
      this.message.lineId || this.message.deletion || this.message.group || ''
    );
  }
  //checks if group message
  private checkIfGroupMessage(): boolean {
    return this.message.group ? true : false;
  }
  //assigns sender Id
  private assignSenderId(): string | null {
    if (this.isGroupMessage) {
      return this.message.sender || '';
    }
    return null;
  }
  //receives message appropriately
  public async receive() {
    try {
      if (this.isGroupMessage) {
        //call group receive class and receive
        const receiver = new ReceiveGroupMessage(
          this.chatId,
          this.senderId,
          this.message,
          this.receiveTime,
        );
        await receiver.receive();
      } else {
        //call direct receive class and receive
        const receiver = new ReceiveDirectMessage(
          this.chatId,
          this.message,
          this.receiveTime,
        );
        await receiver.receive();
      }
    } catch (error) {
      if ('AttemptedReprocessingError' !== error.message) {
        console.log('Error receiving message: ', error);
      }
    }
  }
}

export default ReceiveMessage;
