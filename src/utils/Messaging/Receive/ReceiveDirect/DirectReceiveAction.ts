import {
  DataType,
  MessageStatus,
  PayloadMessageParams,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import * as storage from '@utils/Storage/messages';

class DirectReceiveAction {
  protected message: any;
  protected chatId: string;
  protected receiveTime: string;
  protected decryptedMessageContent: PayloadMessageParams | null;
  constructor(
    chatId: string,
    message: any,
    receiveTime: string,
    decryptedMessageContent: PayloadMessageParams | null = null,
  ) {
    this.chatId = chatId;
    this.message = message;
    this.receiveTime = receiveTime;
    this.decryptedMessageContent = decryptedMessageContent;
  }
  async performAction(): Promise<void> {}
  decryptedMessageContentNotNullRule(): PayloadMessageParams {
    if (!this.decryptedMessageContent) {
      throw new Error('NullDecryptedMessageContent');
    }
    return this.decryptedMessageContent as PayloadMessageParams;
  }
  async saveMessage(data?: DataType) {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const savedMessage: SavedMessageParams = {
      chatId: this.chatId,
      messageId: this.decryptedMessageContent.messageId,
      data: data || this.decryptedMessageContent.data,
      contentType: this.decryptedMessageContent.contentType,
      timestamp: this.receiveTime,
      sender: false,
      messageStatus: MessageStatus.delivered,
      replyId: this.decryptedMessageContent.replyId,
      expiresOn: this.decryptedMessageContent.expiresOn,
    };
    await storage.saveMessage(savedMessage);
  }
}

export default DirectReceiveAction;
