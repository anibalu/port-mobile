import CryptoDriver from '@utils/Crypto/CryptoDriver';
import DirectChat from '@utils/DirectChats/DirectChat';
import {PayloadMessageParams} from '@utils/Messaging/interfaces';

import DirectReceiveAction from './DirectReceiveAction';
import {pickDirectReceiveAction} from './possibleActions';

class ReceiveDirectMessage {
  private message: any;
  private chatId: string;
  private lineId: string;
  private receiveTime: string;
  private receiveClass: DirectReceiveAction | null;
  private decryptedMessageContent: PayloadMessageParams | null;
  //construct the class
  constructor(
    chatId: string,
    lineId: string,
    message: any,
    receiveTime: string,
  ) {
    this.message = message;
    this.receiveTime = receiveTime;
    this.chatId = chatId;
    this.lineId = lineId;
    this.receiveClass = null;
    this.decryptedMessageContent = null;
  }
  //decrypt encrypted message content
  private async extractDecryptedMessageContent(): Promise<void> {
    try {
      if (!this.message.messageContent) {
        this.decryptedMessageContent = null;
        return;
      } else if (
        this.message.messageContent &&
        this.message.messageContent.content
      ) {
        const parsedAndProcessed = JSON.parse(
          this.message.messageContent.content,
        );
        this.decryptedMessageContent =
          parsedAndProcessed as PayloadMessageParams;
      } else if (
        this.message.messageContent &&
        this.message.messageContent.encryptedContent
      ) {
        const chat = new DirectChat(this.chatId);
        try {
          //check if chat data exists and is still connected
          if ((await chat.getChatData()).disconnected) {
            throw new Error('MessageReceivedForDisconnectedChat');
          }
          const cryptoDriver = new CryptoDriver(await chat.getCryptoId());
          const decryptedAndProcessed = JSON.parse(
            await cryptoDriver.decrypt(
              this.message.messageContent.encryptedContent,
            ),
          );
          this.decryptedMessageContent =
            decryptedAndProcessed as PayloadMessageParams;
        } catch (error) {
          console.log(
            'No line data found while decrypting encrypted content. Forcing disconnection: ',
            error,
          );
          //If validation fails, attempt disconnection.
          await DirectChat.cleanDisconnectLine(this.lineId);
          this.decryptedMessageContent = null;
        }
      }
    } catch (error) {
      console.log('Error in extracting decrypted message content: ', error);
      this.decryptedMessageContent = null;
      throw new Error('Message content extraction failed');
    }
  }
  //assign receive action
  private async assignReceiverClass() {
    this.receiveClass = await pickDirectReceiveAction(
      this.chatId,
      this.lineId,
      this.message,
      this.receiveTime,
      this.decryptedMessageContent,
    );
  }
  //perform receive action
  async receive() {
    console.log('Extracting decrypted content');
    await this.extractDecryptedMessageContent();
    console.log('Trying to assign receiver for: ', this.lineId, this.message);
    await this.assignReceiverClass();
    if (this.receiveClass) {
      await this.receiveClass.validate();
      await this.receiveClass.performAction();
    } else {
      console.error('Could not assign a receiver for this message');
    }
  }
}

export default ReceiveDirectMessage;
