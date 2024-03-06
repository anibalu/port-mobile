import {
  ContentType,
  DataType,
  MessageDataTypeBasedOnContentType,
  MessageStatus,
  PayloadMessageParams,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import * as storage from '@utils/Storage/messages';
import {SendDirectMessage} from './AbstractSender';
import {generateRandomHexId} from '@utils/IdGenerator';
import {generateISOTimeStamp} from '@utils/Time';
import {MESSAGE_DATA_MAX_LENGTH} from '@configs/constants';
import * as API from '../../APICalls';

export const updateContentTypes: ContentType[] = [ContentType.update];

export class SendUpdateDirectMessage<
  T extends ContentType,
> extends SendDirectMessage<T> {
  chatId: string; //chatId of chat
  contentType: ContentType; //contentType of message
  data: DataType; //message data corresponding to the content type
  replyId: string | null; //not null if message is a reply message (optional)
  messageId: string; //messageId of message (optional)
  savedMessage: SavedMessageParams; //message to be saved to storage
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
      memberId: null,
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
   * Send an update. Cannot be journalled and is never saved to FS.
   * @returns whether errors found
   */
  async send(onUpdateSuccess?: (success: boolean) => void): Promise<boolean> {
    try {
      // Set up in Filesystem
      this.validate();
      const processedPayload = this.encryedtMessage();
      const newSendStatus = await API.sendObject(
        this.chatId,
        processedPayload,
        false,
      );
      if (onUpdateSuccess) {
        onUpdateSuccess(newSendStatus >= MessageStatus.sent);
      }
    } catch (e) {
      console.error('Could not send message', e);
      await this.onFailure();
      return false;
    }
    this.storeCalls();
    return true;
  }
  /**
   * Perform the initial DBCalls and attempt API calls
   */
  private validate(): void {
    try {
      if (!updateContentTypes.includes(this.contentType)) {
        throw new Error('NotGenericContentTypeError');
      }
      if (JSON.stringify(this.data).length >= MESSAGE_DATA_MAX_LENGTH) {
        throw new Error('MessageDataTooBigError');
      }
    } catch (error) {
      console.error('Error found in initial checks: ', error);
      throw new Error('InitialChecksError');
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
    try {
      await this.loadSavedMessage();
      const processedPayload = await this.encryedtMessage();
      // Perform API call
      const udpatedStatus = await API.sendObject(
        this.chatId,
        processedPayload,
        false,
      );
      // Update message's send status
      await storage.updateMessageSendStatus(this.chatId, {
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

    this.storeCalls();
    await this.cleanup();
    return true;
  }

  private async onFailure() {}

  /**
   * Perform necessary cleanup after sending succeeds
   */
  private async cleanup(): Promise<boolean> {
    return true;
  }

  /**
   * Trigger redux store calls after successfully sending the message
   */
  private storeCalls(): void {
    return;
  }

  /**
   * Updates trigger no connectionInfo updates so we simply return
   * @param newSendStatus The status of the message send
   * @returns void
   */
  private async updateConnectionInfo(newSendStatus: MessageStatus) {
    newSendStatus;
    return;
  }
}
