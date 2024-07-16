import {
  ContentType,
  DataType,
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
import {LineMessageData} from '@utils/Storage/DBCalls/lineMessage';

/**
 * Content types that trigger this sender
 */
export const plaintextContentTypes: ContentType[] = [
  ContentType.handshakeA1,
  ContentType.handshakeB2,
];

/**
 * This class manages sending messages that only need to be cached until they
 * Are successfully sent to their peer.
 * Messages in this class are completely removed from the local filesystem once
 * they are sent.
 * Messages sent in this class are not encrypted.
 */
export class SendPlaintextDirectMessage<
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

  /**
   * This class does not cause the connection preview text to update.
   * @returns empty string
   */
  generatePreviewText(): string {
    return '';
  }

  private validate(): void {
    try {
      //throw error if content type is not supported by this class
      if (!plaintextContentTypes.includes(this.contentType)) {
        throw new Error('NotPlaintextContentTypeError');
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

  async send(_onSuccess?: (x: boolean) => void): Promise<boolean> {
    try {
      this.validate();
      //save to fs
      await storage.saveMessage(this.savedMessage);
    } catch (e) {
      console.error('Could not send message', e);
      await this.onFailure();
      return false;
    }
    /**
     * In this case, once the message has been set up,
     * sending and resending are exactly the same.
     */
    this.retry();
    return true;
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
      await this.loadSavedMessage();
      //payload string is unencrypted.
      const processedPayload = {content: JSON.stringify(this.payload)};
      //attempt to send.
      const sendStatus = await this.attempt(processedPayload);
      // Update message's send status accordingly
      await storage.updateMessageStatus(this.chatId, {
        messageIdToBeUpdated: this.messageId,
        updatedMessageStatus: sendStatus,
      });
      // Update connection card's message
      await this.updateConnectionInfo(sendStatus);
    } catch (e) {
      console.error('Could not send message', e);
      await this.onFailure();
      return false;
    }
    await this.cleanup();
    return true;
  }

  /**
   * Perform api call to post the processed payload and return message status accordingly.
   * @param processedPayload
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
      console.log('send attempt failed, message to be journaled');
      return MessageStatus.journaled;
    }
  }

  /**
   * Perform these actions on critical failures.
   */
  private async onFailure() {
    this.updateConnectionInfo(MessageStatus.failed);
    storage.updateMessageStatus(this.chatId, {
      messageIdToBeUpdated: this.messageId,
      updatedMessageStatus: MessageStatus.failed,
    });
  }

  /**
   * Perform necessary cleanup after sending succeeds
   */
  private async cleanup() {
    // Plaintext messages do not need any cleanup as of now
    return;
  }

  /**
   * Perform necessary updates to connection info
   */
  private async updateConnectionInfo(_newSendStatus: MessageStatus) {
    // Plaintext messages do not need any updates as of now
    return;
  }
}
