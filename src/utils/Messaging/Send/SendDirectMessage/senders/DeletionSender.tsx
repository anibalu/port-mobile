import {
  ContentType,
  DataType,
  DeletionParams,
  MessageDataTypeBasedOnContentType,
  MessageStatus,
  PayloadMessageParams,
} from '@utils/Messaging/interfaces';
import * as storage from '@utils/Storage/messages';
import {SendDirectMessage} from './AbstractSender';
import {generateRandomHexId} from '@utils/IdGenerator';
import {generateISOTimeStamp} from '@utils/Time';
import {MESSAGE_DATA_MAX_LENGTH} from '@configs/constants';
import * as API from '../../APICalls';
import {updateConnectionIfLatestMessageIsX} from '@utils/Storage/connections';
import {LineMessageData} from '@utils/Storage/DBCalls/lineMessage';
import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';

export const deleteContentTypes: ContentType[] = [ContentType.deleted];

export class SendDeleteDirectMessage<
  T extends ContentType,
> extends SendDirectMessage<T> {
  chatId: string; //chatId of chat
  contentType: ContentType; //contentType of message
  data: DataType; //message data corresponding to the content type
  replyId: string | null; //not null if message is a reply message (optional)
  messageId: string; //messageId of message (optional)
  savedMessage: LineMessageData; //message to be saved to storage
  payload: PayloadMessageParams; //message to be encrypted and sent.
  expiresOn: string | null;
  constructor(
    chatId: string,
    type: T,
    data: MessageDataTypeBasedOnContentType<T>,
    replyId: string | null = null,
    messageId: string = generateRandomHexId(),
  ) {
    super(chatId, type, data, replyId, messageId);
    this.chatId = chatId;
    this.contentType = type;
    this.data = data;
    this.messageId = messageId;
    this.replyId = replyId;
    this.savedMessage = {
      chatId: this.chatId,
      messageId: this.messageId,
      contentType: this.contentType,
      data: this.data,
      timestamp: generateISOTimeStamp(),
      sender: true,
      messageStatus: MessageStatus.unassigned,
      replyId: this.replyId,
      expiresOn: null,
    };
    this.payload = {
      messageId: this.messageId,
      contentType: this.contentType,
      data: this.data,
      replyId: this.replyId,
      expiresOn: null,
    };

    this.expiresOn = null;
  }

  /**
   * @returns preview text to update the connection with.
   */
  generatePreviewText(): string {
    return getConnectionTextByContentType(this.contentType, this.data);
  }

  private validate(): void {
    try {
      //throw error if content type is not supported by this class
      if (!deleteContentTypes.includes(this.contentType)) {
        throw new Error('NotUpdateContentTypeError');
      }
      //throw error if message exceeds acceptable character size
      if (JSON.stringify(this.data).length >= MESSAGE_DATA_MAX_LENGTH) {
        throw new Error('MessageDataTooBigError');
      }
    } catch (error) {
      console.error('Error found in initial checks: ', error);
      throw new Error('InitialChecksError');
    }
  }

  /**
   * Send an deletion update. Cannot be journalled and is never saved to FS.
   */
  async send(_onUpdateSuccess?: (success: boolean) => void): Promise<boolean> {
    try {
      if (!(await this.isAuthenticated())) {
        console.warn(
          '[SendDeleteDirectMessage] Trying to send before authentication. Failed.',
        );
        return false;
      }
      this.validate();
      const deletionData = this.data as DeletionParams;
      const processedPayload = await this.encryptedMessage();
      const newSendStatus = await this.attempt(processedPayload);
      if (newSendStatus !== MessageStatus.sent) {
        throw new Error('DeletionUpdateFailed');
      }
      //invoke local deletion and connection updates only if deletion update is sent successfully.
      await this.updateConnectionInfo(deletionData.messageIdToDelete);
      await storage.cleanDeleteMessage(
        this.chatId,
        deletionData.messageIdToDelete,
        true,
      );
    } catch (e) {
      await this.onFailure();
      return false;
    }
    this.storeCalls();
    return true;
  }

  private async loadSavedMessage() {
    console.error('Updates cannot be saved');
    throw new Error('UnloadableMessageType');
  }

  /**
   * Perform api call to post the processed payload and return message status accordingly.
   * @param processedPayload
   * @returns appropriate message status
   */
  async attempt(processedPayload: object): Promise<MessageStatus> {
    try {
      // Perform API call
      await API.sendObject(
        this.chatId,
        processedPayload,
        false,
        this.isNotificationSilent(),
      );
      return MessageStatus.sent;
    } catch (error) {
      console.log(
        'send attempt failed, message type does not support journaling',
      );
      return MessageStatus.failed;
    }
  }

  /**
   * Retry sending a journalled message using only API calls
   */
  async retry(): Promise<boolean> {
    throw new Error('NotJournallable');
  }

  private async onFailure() {
    return;
  }

  /**
   * Perform necessary cleanup after sending succeeds
   */
  private async cleanup() {
    return;
  }

  /**
   * Update connection with preview text and new send status.
   * Update only if latest message Id in connection matches message Id being deleted.
   */
  private async updateConnectionInfo(messageIdToDelete: string) {
    const update = {
      chatId: this.chatId,
      text: this.generatePreviewText(),
      recentMessageType: ContentType.deleted,
    };
    //marks the message deleted in chat tile if the deleted message was the latest
    await updateConnectionIfLatestMessageIsX(messageIdToDelete, update);
  }
}
