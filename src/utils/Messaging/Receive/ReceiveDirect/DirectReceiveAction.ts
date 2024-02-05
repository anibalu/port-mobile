import store from '@store/appStore';
import {getChatPermissions} from '@utils/ChatPermissions';
import {ChatType} from '@utils/Connections/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {
  ContentType,
  DataType,
  LargeDataMessageContentTypes,
  LargeDataParams,
  MessageStatus,
  PayloadMessageParams,
  SavedMessageParams,
  UpdateRequiredMessageContentTypes,
} from '@utils/Messaging/interfaces';
import {saveNewMedia} from '@utils/Storage/media';
import * as storage from '@utils/Storage/messages';
import {generateISOTimeStamp} from '@utils/Time';

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
    store.dispatch({
      type: 'NEW_RECEIVED_MESSAGE',
      payload: savedMessage,
    });
    //All messages do not need to have their status updated.
    if (
      UpdateRequiredMessageContentTypes.includes(
        this.decryptedMessageContent.contentType,
      )
    ) {
      const readReceipts = await getChatPermissions(
        this.chatId,
        ChatType.direct,
      );
      const sender = new SendMessage(this.chatId, ContentType.update, {
        messageIdToBeUpdated: this.decryptedMessageContent.messageId,
        updatedMessageStatus: MessageStatus.delivered,
        deliveredAtTimestamp: generateISOTimeStamp(),
        shouldAck: readReceipts.readReceipts,
      });
      await sender.send();
      console.log('Delivered message sent');
    }
  }
}

export default DirectReceiveAction;
