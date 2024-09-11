import {
  ContentType,
  DataType,
  MessageDataTypeBasedOnContentType,
  MessageStatus,
  PayloadMessageParams,
  connectionUpdateExemptTypes,
} from '@utils/Messaging/interfaces';
import * as storage from '@utils/Storage/messages';
import {SendDirectMessage} from './AbstractSender';
import {generateRandomHexId} from '@utils/IdGenerator';
import {generateExpiresOnISOTimestamp, generateISOTimeStamp} from '@utils/Time';
import {MESSAGE_DATA_MAX_LENGTH} from '@configs/constants';
import * as API from '../../APICalls';
import {ChatType} from '@utils/Storage/DBCalls/connections';
import {updateConnectionOnNewMessage} from '@utils/Storage/connections';
import {getChatPermissions} from '@utils/ChatPermissions';
import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';
import {LineMessageData} from '@utils/Storage/DBCalls/lineMessage';

/**
 * Content types that trigger this sender
 */
export const genericContentTypes: ContentType[] = [
  ContentType.text,
  ContentType.link,
  ContentType.name,
  ContentType.info,
  ContentType.initialInfoRequest,
  ContentType.displayAvatar,
  ContentType.disappearingMessages,
  ContentType.contactBundleResponse,
  ContentType.contactPortRequest,
  ContentType.contactPortPermissionRequest,
];

/**
 * Subset content types that support disappearing messages
 */
const genericDisappearingTypes: ContentType[] = [
  ContentType.text,
  ContentType.link,
];

export class SendGenericDirectMessage<
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
      //initial state is journaled for this class
      messageStatus: MessageStatus.journaled,
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

  private validate(): void {
    //throw error if content type is not supported by this class
    if (!genericContentTypes.includes(this.contentType)) {
      throw new Error('NotGenericContentTypeError');
    }
    //throw error if message exceeds acceptable character size
    if (JSON.stringify(this.data).length >= MESSAGE_DATA_MAX_LENGTH) {
      throw new Error('MessageDataTooBigError');
    }
  }

  async send(_onSuccess?: (x: boolean) => void): Promise<boolean> {
    try {
      this.validate();
      await this.setDisappearing();
      try {
        await storage.saveMessage(this.savedMessage);
        this.storeCalls();
      } catch (e) {
        console.warn('Error adding message to FS', e);
        console.warn(
          'You may be using send to retry. Please migrate to retry instead.',
        );
        await this.retry();
        return true;
      }
    } catch (e) {
      console.error('Could not send message', e);
      await this.onFailure(e);
      this.storeCalls();
      return false;
    }
    /**
     * In this case, once the message haas been set up,
     * sending and resending are exactly the same.
     */
    this.retry();
    return true;
  }

  /**
   * Setup disappearing message supported types with expiry
   */
  private async setDisappearing() {
    if (genericDisappearingTypes.includes(this.contentType)) {
      this.expiresOn = generateExpiresOnISOTimestamp(
        (await getChatPermissions(this.chatId, ChatType.direct))
          .disappearingMessages,
      );
      this.savedMessage.expiresOn = this.expiresOn;
      this.payload.expiresOn = this.expiresOn;
    }
  }

  /**
   * Reconstruct saved message and payload from db.
   */
  private async loadSavedMessage() {
    const savedMessage = await storage.getMessage(this.chatId, this.messageId);
    if (!savedMessage) {
      throw Error('MessageNotFound');
    }
    this.savedMessage = savedMessage;
    this.payload = {
      messageId: savedMessage.messageId,
      contentType: this.contentType,
      data: savedMessage.data,
      replyId: savedMessage.replyId,
      expiresOn: this.expiresOn,
    };
  }

  /**
   * Retry sending a journalled message using only API calls
   */
  async retry(): Promise<boolean> {
    try {
      if (!(await this.isAuthenticated())) {
        console.warn(
          '[SendPlaintextDirectMessage] tried sending message when unauthenticated. Journalling',
        );
        return false;
      }
      await this.loadSavedMessage();
      const processedPayload = await this.encryptedMessage();
      //attempt to send.
      const sendStatus = await this.attempt(processedPayload);
      // Update message's send status
      await storage.updateMessageStatus(this.chatId, {
        messageIdToBeUpdated: this.messageId,
        updatedMessageStatus: sendStatus,
      });
      // Update connection card's message
      await this.updateConnectionInfo(sendStatus);
    } catch (e) {
      console.error('Could not send message', e);
      await this.onFailure();
      this.storeCalls();
      return false;
    }
    await this.cleanup();
    this.storeCalls();
    return true;
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
      console.log('send attempt failed, message to be journaled', error);
      return MessageStatus.journaled;
    }
  }

  /**
   * Perform these actions on critical failures.
   */
  private async onFailure(error: any = null) {
    await storage.updateMessageStatus(this.chatId, {
      messageIdToBeUpdated: this.messageId,
      updatedMessageStatus: MessageStatus.failed,
    });
    await this.updateConnectionInfo(MessageStatus.failed);
    if (
      typeof error === 'object' &&
      error.message === 'MessageDataTooBigError'
    ) {
      throw new Error(error.message);
    }
  }

  /**
   * Perform necessary cleanup after sending succeeds
   */
  private async cleanup() {
    // This class messages do not need any cleanup as of now
    return;
  }

  /**
   * @returns preview text to update the connection with.
   */
  generatePreviewText(): string {
    return getConnectionTextByContentType(this.contentType, this.data);
  }

  /**
   * Update connection with preview text and new send status.
   * Update only if content type is not exempt from triggering connection updates
   * @param newSendStatus
   */
  private async updateConnectionInfo(newSendStatus: MessageStatus) {
    if (!connectionUpdateExemptTypes.includes(this.contentType)) {
      await updateConnectionOnNewMessage({
        chatId: this.chatId,
        text: this.generatePreviewText(),
        readStatus: newSendStatus,
        recentMessageType: this.contentType,
        latestMessageId: this.messageId,
      });
    }
  }
}
