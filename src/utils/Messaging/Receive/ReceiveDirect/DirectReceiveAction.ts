import {getChatPermissions} from '@utils/ChatPermissions';
import {ChatType} from '@utils/Storage/DBCalls/connections';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {
  ContentType,
  DataType,
  MessageStatus,
  PayloadMessageParams,
  UpdateRequiredMessageContentTypes,
} from '@utils/Messaging/interfaces';
import {LineMessageData} from '@utils/Storage/DBCalls/lineMessage';
import * as storage from '@utils/Storage/messages';
import {generateISOTimeStamp} from '@utils/Time';
import DirectChat from '@utils/DirectChats/DirectChat';

class DirectReceiveAction {
  protected message: any;
  protected chatId: string;
  protected lineId: string;
  protected receiveTime: string;
  protected decryptedMessageContent: PayloadMessageParams | null;
  constructor(
    chatId: string,
    lineId: string,
    message: any,
    receiveTime: string,
    decryptedMessageContent: PayloadMessageParams | null = null,
  ) {
    this.chatId = chatId;
    this.lineId = lineId;
    this.message = message;
    this.receiveTime = receiveTime;
    this.decryptedMessageContent = decryptedMessageContent;
  }

  /**
   * Default validation steps. This may differ for some classes like new chat creation classes.
   */
  async validate(): Promise<void> {
    const chat = new DirectChat(this.chatId);
    try {
      //check if line and associated data exists
      const lineData = await chat.getChatData();
      //check if line is still connected
      if (lineData.disconnected) {
        throw new Error('MessageReceivedForDisconnectedChat');
      }
    } catch (error) {
      //If validation fails, attempt disconnection.
      //We don't need to go this extreme in the future.
      await chat.disconnect(this.lineId);
    }
  }

  async performAction(): Promise<void> {}
  decryptedMessageContentNotNullRule(): PayloadMessageParams {
    if (!this.decryptedMessageContent) {
      throw new Error('NullDecryptedMessageContent');
    }
    return this.decryptedMessageContent as PayloadMessageParams;
  }

  generatePreviewText(): string {
    return '';
  }

  async saveMessage(data?: DataType) {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const savedMessage: LineMessageData = {
      chatId: this.chatId,
      messageId: this.decryptedMessageContent.messageId,
      data: data || this.decryptedMessageContent.data,
      contentType: this.decryptedMessageContent.contentType,
      timestamp: this.receiveTime,
      sender: false,
      messageStatus: MessageStatus.delivered,
      replyId: this.decryptedMessageContent.replyId,
      expiresOn: this.decryptedMessageContent.expiresOn,
      shouldAck:
        ((await getChatPermissions(this.chatId, ChatType.direct))
          .readReceipts as boolean) || false,
    };
    await storage.saveMessage(savedMessage);
  }

  /**
   * checks if a message is already saved. If it is, throws an error.
   * This is used to guard against multi-processing of messages.
   */
  async doubleProcessingGuard() {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const msg = await storage.getMessage(
      this.chatId,
      this.decryptedMessageContent.messageId,
    );
    if (msg) {
      throw new Error('AttemptedReprocessingError');
    }
  }

  async sendReceiveUpdate() {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //All messages do not need to have their status updated.
    if (
      UpdateRequiredMessageContentTypes.includes(
        this.decryptedMessageContent.contentType,
      )
    ) {
      const sender = new SendMessage(this.chatId, ContentType.receipt, {
        messageId: this.decryptedMessageContent.messageId,
        deliveredAt: generateISOTimeStamp(),
      });
      await sender.send();
      console.log('Delivered message sent');
    }
  }
}

export default DirectReceiveAction;
