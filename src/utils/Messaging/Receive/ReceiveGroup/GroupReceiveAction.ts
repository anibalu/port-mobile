import {generateRandomHexId} from '@utils/IdGenerator';
import {
  ContentType,
  DataType,
  InfoParams,
  LargeDataMessageContentTypes,
  LargeDataParams,
  MessageStatus,
  PayloadMessageParams,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import {saveNewMedia} from '@utils/Storage/media';
import * as storage from '@utils/Storage/messages';

class GroupReceiveAction {
  protected message: any;
  protected chatId: string;
  protected receiveTime: string;
  protected senderId: string;
  protected content: any;
  protected decryptedMessageContent: PayloadMessageParams | null;
  constructor(
    chatId: string,
    senderId: string,
    message: any,
    receiveTime: string,
    content: any = null,
    decryptedMessageContent: PayloadMessageParams | null = null,
  ) {
    this.chatId = chatId;
    this.senderId = senderId;
    this.message = message;
    this.receiveTime = receiveTime;
    this.content = content;
    this.decryptedMessageContent = decryptedMessageContent;
  }
  async performAction(): Promise<void> {}
  decryptedMessageContentNotNullRule() {
    if (!this.decryptedMessageContent) {
      throw new Error('NullDecryptedMessageContent');
    }
    return this.decryptedMessageContent as PayloadMessageParams;
  }
  async saveMessage(data?: DataType) {
    if (!this.decryptedMessageContent) {
      //carve out only for saved info  messages
      if (!data || (data && (data as InfoParams).info)) {
        const savedMessage: SavedMessageParams = {
          chatId: this.chatId,
          messageId: generateRandomHexId(),
          data: data || {info: 'no data'},
          contentType: ContentType.info,
          timestamp: this.receiveTime,
          sender: false,
        };
        await storage.saveMessage(savedMessage);
      }
    } else {
      const savedMessage: SavedMessageParams = {
        chatId: this.chatId,
        messageId: this.decryptedMessageContent.messageId,
        data: data || this.decryptedMessageContent.data,
        contentType: this.decryptedMessageContent.contentType,
        timestamp: this.receiveTime,
        sender: false,
        memberId: this.senderId,
        messageStatus: MessageStatus.delivered,
        replyId: this.decryptedMessageContent.replyId,
        expiresOn: this.decryptedMessageContent.expiresOn,
      };
      if (
        LargeDataMessageContentTypes.includes(
          this.decryptedMessageContent.contentType,
        )
      ) {
        //Create a media entry in DB for the same
        await saveNewMedia(
          (this.decryptedMessageContent.data as LargeDataParams).mediaId!,
          this.chatId,
          this.decryptedMessageContent.messageId,
          this.receiveTime,
        );
      }
      await storage.saveMessage(savedMessage);
    }
  }
}

export default GroupReceiveAction;
