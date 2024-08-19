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
import {getConnection} from '@utils/Storage/connections';
import {LineMessageData} from '@utils/Storage/DBCalls/lineMessage';
import {fetchContactPortBundle} from '@utils/Ports/contactport';

/**
 * Content types that trigger this sender
 */
export const contactPortBundleContentTypes: ContentType[] = [
  ContentType.contactPortBundle,
];

export class SendContactPortBundleDirectMessage<
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
      data: {...this.data},
      replyId: this.replyId,
      expiresOn: null,
    };
    console.log('contact port bundle payload:', this.payload.data);
    this.expiresOn = null;
  }

  private validate(): void {
    try {
      //throw error if content type is not supported by this class
      if (!contactPortBundleContentTypes.includes(this.contentType)) {
        throw new Error('NotContactBundleTypeError');
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
      // Set up in Filesystem
      this.validate();
      try {
        await storage.saveMessage(this.savedMessage);
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
      return false;
    }
    /**
     * In this case, once the message haas been set up,
     * sending and resending are exactly the same.
     */
    await this.retry();
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
      data: {...savedMessage.data},
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
          '[SendContactBundleDirect] Attempting to send prior to authentication. Journalled.',
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
      //we check if contact bundle has been created.
      let bundle = this.savedMessage.data?.bundle;
      if (!bundle) {
        //if bundle does not exist, we attempt to create it.
        bundle = await fetchContactPortBundle(
          (
            await getConnection(this.chatId)
          ).pairHash,
        );
      }
      //if bundle still does not exist, we throw an error
      if (!bundle) {
        throw new Error('bundle validation error');
      }
      this.savedMessage.data = {bundle: bundle};
      this.payload.data = {bundle: bundle};
      await storage.updateMessageData(
        this.chatId,
        this.messageId,
        this.savedMessage.data,
      );
      // Perform API call
      const processedPayload = await this.encryptedMessage();
      const udpatedStatus = await this.attempt(processedPayload);
      // Update message's send status
      await storage.updateMessageStatus(this.chatId, {
        messageIdToBeUpdated: this.messageId,
        updatedMessageStatus: udpatedStatus,
      });
    } catch (e) {
      console.error('Could not send message', e);
      await this.onFailure(e);
      return false;
    }
    await this.cleanup();
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
      console.log('send attempt failed, message to be journaled');
      return MessageStatus.journaled;
    }
  }

  /**
   * Perform these actions on critical failures.
   */
  private async onFailure(error: any) {
    if (error && error.message && error.message === 'APIError') {
      return;
    }
    await storage.permanentlyDeleteMessage(this.chatId, this.messageId);
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
  generatePreviewText() {
    return '';
  }
}
