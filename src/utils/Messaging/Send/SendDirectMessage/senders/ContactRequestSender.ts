import {
  ContactBundleRequestParams,
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
import {generateISOTimeStamp} from '@utils/Time';
import {MESSAGE_DATA_MAX_LENGTH} from '@configs/constants';
import * as API from '../../APICalls';
import {updateConnectionOnNewMessage} from '@utils/Storage/connections';
import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';
import {LineMessageData} from '@utils/Storage/DBCalls/lineMessage';

export const contactBundleRequestContentTypes: ContentType[] = [
  ContentType.contactBundleRequest,
];

export class SendContactRequestDirectMessage<
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
      data: {...this.data, destinationChatId: undefined},
      replyId: this.replyId,
      expiresOn: null,
    };
    console.log('contact request payload', this.payload.data);
    this.expiresOn = null;
  }

  async send(_onSuccess?: (x: boolean) => void): Promise<boolean> {
    try {
      // Set up in Filesystem
      this.validate();
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
      await this.onFailure();
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
   * Perform the initial DBCalls and attempt API calls
   */
  private validate(): void {
    try {
      if (!contactBundleRequestContentTypes.includes(this.contentType)) {
        throw new Error('NotContactBundleTypeError');
      }
      const data = this.data as ContactBundleRequestParams;
      if (!(data.destinationChatId && data.destinationName)) {
        throw new Error('MissingDestinationData');
      }
      if (JSON.stringify(this.data).length >= MESSAGE_DATA_MAX_LENGTH) {
        throw new Error('MessageDataTooBigError');
      }
    } catch (error) {
      console.error('Error found in initial checks: ', error);
      throw new Error('InitialChecksError');
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
      //destinationName is all that needs to be sent
      data: {
        destinationName: (this.savedMessage.data as ContactBundleRequestParams)
          .destinationName,
      },
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
          '[SendContactRequestDirect] Attempting to send prior to authentication. Journalled.',
        );
        return true;
      }
    } catch (e) {
      // Something has gone horribly wrong, cleanly delete this message
      // It actually isn't horribly wrong, it's just associated with a chat
      // That no longer exists
      await storage.permanentlyDeleteMessage(this.chatId, this.messageId);
    }
    try {
      await this.loadSavedMessage();
      const processedPayload = await this.encryptedMessage();
      // Perform API call
      const udpatedStatus = await this.attempt(processedPayload);
      // Update message's send status
      await storage.updateMessageStatus(this.chatId, {
        messageIdToBeUpdated: this.messageId,
        updatedMessageStatus: udpatedStatus,
      });
      // Update connection card's message
      await this.updateConnectionInfo(udpatedStatus);
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
      console.log(
        'send attempt failed, message type does not support journaling',
      );
      return MessageStatus.journaled;
    }
  }

  /**
   * Perform these actions on critical failures.
   */
  private async onFailure() {
    storage.updateMessageStatus(this.chatId, {
      messageIdToBeUpdated: this.messageId,
      updatedMessageStatus: MessageStatus.failed,
    });
  }

  /**
   * Perform necessary cleanup after sending succeeds
   */
  private async cleanup() {
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
