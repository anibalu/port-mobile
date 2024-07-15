import {
  ContentType,
  DataType,
  MessageDataTypeBasedOnContentType,
  MessageStatus,
  PayloadMessageParams,
  ReceiptParams,
} from '@utils/Messaging/interfaces';
import * as MessageStorage from '@utils/Storage/messages';
import {SendDirectMessage} from './AbstractSender';
import {generateRandomHexId} from '@utils/IdGenerator';
import {generateISOTimeStamp} from '@utils/Time';
import {MESSAGE_DATA_MAX_LENGTH} from '@configs/constants';
import * as API from '../../APICalls';
import {LineMessageData} from '@utils/Storage/DBCalls/lineMessage';

export const receiptContentTypes: ContentType[] = [ContentType.receipt];

export class SendReceiptDirectMessage<
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
   * This class does not cause the connection preview text to update.
   * @returns empty string
   */
  generatePreviewText(): string {
    return '';
  }

  private validate(): void {
    try {
      //throw error if content type is not supported by this class
      if (!receiptContentTypes.includes(this.contentType)) {
        throw new Error('NotReactionContentTypeError');
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
   * Send an update. Cannot be journalled and is never saved to FS.
   * @returns whether errors found
   */
  async send(_onUpdateSuccess?: (success: boolean) => void): Promise<boolean> {
    try {
      // Set up in Filesystem
      this.validate();
      const receipt = this.data as ReceiptParams;
      // Make the API call to send the receipt
      const processedPayload = await this.encryptedMessage();
      const newSendStatus = await this.attempt(processedPayload);
      if (newSendStatus === MessageStatus.sent && receipt.readAt) {
        //this guard ensures receipts are not sent again for a read message.
        await MessageStorage.setShouldNotAck(this.chatId, receipt.messageId);
      }
      return true;
    } catch (e) {
      console.error('Could not send message', e);
      await this.onFailure();
      return false;
    }
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

  private async loadSavedMessage() {
    console.error('Updates cannot be saved');
    throw new Error('UnloadableMessageType');
  }

  /**
   * Retry sending a journalled message using only API calls
   */
  async retry(): Promise<boolean> {
    throw new Error('NotJournallable');
  }

  /**
   * Perform these actions on critical failures.
   */
  private async onFailure() {
    return;
  }

  /**
   * Perform necessary cleanup after sending succeeds
   */
  private async cleanup() {
    return;
  }
}
