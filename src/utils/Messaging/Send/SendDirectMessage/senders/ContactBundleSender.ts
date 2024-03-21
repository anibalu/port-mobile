import {
  ContactBundleParams,
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
import {ReadStatus} from '@utils/Connections/interfaces';
import {updateConnectionOnNewMessage} from '@utils/Connections';

export const contactBundleContentTypes: ContentType[] = [
  ContentType.contactBundle,
];

export class SendContactBundleDirectMessage<
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
      data: {...this.data, goToChatId: undefined},
      replyId: this.replyId,
      expiresOn: null,
    };
    console.log('contact bundle payload', this.payload.data);
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
        this.retry();
        return true;
      }
      // this.storeCalls();
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
      if (!contactBundleContentTypes.includes(this.contentType)) {
        throw new Error('NotContactBundleTypeError');
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
    const savedMessage = await storage.getMessage(this.chatId, this.messageId);
    if (savedMessage) {
      this.savedMessage = savedMessage as SavedMessageParams;
      this.payload = {
        messageId: savedMessage.messageId,
        contentType: this.contentType,
        data: {...savedMessage.data, goToChatId: undefined},
        replyId: savedMessage.replyId,
        expiresOn: this.expiresOn,
      };
    }
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

  private async onFailure() {
    this.updateConnectionInfo(MessageStatus.failed);
    storage.updateMessageSendStatus(this.chatId, {
      messageIdToBeUpdated: this.messageId,
      updatedMessageStatus: MessageStatus.failed,
    });
  }

  /**
   * Perform necessary cleanup after sending succeeds
   */
  private async cleanup(): Promise<boolean> {
    return true;
  }

  private async updateConnectionInfo(newSendStatus: MessageStatus) {
    //create ReadStatus attribute based on send status.

    let readStatus: ReadStatus = ReadStatus.failed;
    switch (newSendStatus) {
      case MessageStatus.sent:
        readStatus = ReadStatus.sent;
        break;
      case MessageStatus.journaled:
        readStatus = ReadStatus.journaled;
        break;
    }
    let text: string = '';
    switch (this.contentType) {
      case ContentType.contactBundle:
        text = 'shared contact of ' + (this.data as ContactBundleParams).name;
        break;
      default:
        return;
    }
    await updateConnectionOnNewMessage({
      chatId: this.chatId,
      text,
      readStatus: readStatus,
      recentMessageType: this.contentType,
      latestMessageId: this.messageId,
    });
  }
}
