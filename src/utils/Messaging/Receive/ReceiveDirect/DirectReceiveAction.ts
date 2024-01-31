import store from '@store/appStore';
import {
  DataType,
  LargeDataMessageContentTypes,
  LargeDataParams,
  MessageStatus,
  PayloadMessageParams,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import {saveNewMedia} from '@utils/Storage/media';
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
  }
}

export default DirectReceiveAction;
