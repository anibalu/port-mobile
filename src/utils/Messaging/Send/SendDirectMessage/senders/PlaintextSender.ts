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

export const plaintextContentTypes: ContentType[] = [
  ContentType.handshakeA1,
  ContentType.handshakeB2,
];

/**
 * This class manages sending messages that only need to be cached until they
 * Are successfully sent to their peer.
 * Messages in this class are completely removed from the local filesystem once
 * they are sent.
 */
export class SendPlaintextDirectMessage<
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

  generatePreviewText(): string {
    return '';
  }

  async send(_onSuccess?: (x: boolean) => void): Promise<boolean> {
    try {
      // Set up in Filesystem
      this.validate();
      storage.saveMessage(this.savedMessage);
      this.storeCalls();
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
    this.storeCalls();
    return true;
  }
  /**
   * Perform the initial DBCalls and attempt API calls
   */
  private validate(): void {
    try {
      if (!plaintextContentTypes.includes(this.contentType)) {
        throw new Error('NotPlaintextContentTypeError');
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
        data: savedMessage.data,
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
      const processedPayload = {content: JSON.stringify(this.payload)};
      // Perform API call
      const udpatedStatus = await API.sendObject(
        this.chatId,
        processedPayload,
        false,
        this.isNotificationSilent(),
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
    // Plaintext messages do not need any updates as of now
    newSendStatus; // Calm down linter
    return;
  }
}
