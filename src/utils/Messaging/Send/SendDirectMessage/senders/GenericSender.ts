import {
  ContactBundleParams,
  ContentType,
  DataType,
  LinkParams,
  MessageDataTypeBasedOnContentType,
  MessageStatus,
  PayloadMessageParams,
  SavedMessageParams,
  TextParams,
  connectionUpdateExemptTypes,
} from '@utils/Messaging/interfaces';
import * as storage from '@utils/Storage/messages';
import {SendDirectMessage} from './AbstractSender';
import {generateRandomHexId} from '@utils/IdGenerator';
import {generateExpiresOnISOTimestamp, generateISOTimeStamp} from '@utils/Time';
import {MESSAGE_DATA_MAX_LENGTH} from '@configs/constants';
import * as API from '../../APICalls';
import {ChatType, ReadStatus} from '@utils/Connections/interfaces';
import {updateConnectionOnNewMessage} from '@utils/Connections';
import {getChatPermissions} from '@utils/ChatPermissions';

export const genericContentTypes: ContentType[] = [
  ContentType.text,
  ContentType.link,
  ContentType.name,
  ContentType.info,
  ContentType.initialInfoRequest,
  ContentType.displayAvatar,
  ContentType.disappearingMessages,
  ContentType.contactBundleResponse,
];

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

  async send(_onSuccess?: (x: boolean) => void): Promise<boolean> {
    try {
      // Set up in Filesystem
      this.validate();
      await this.setDisappearing();
      // Set initial message statud
      this.savedMessage.messageStatus = MessageStatus.journaled;
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
   * Perform the initial DBCalls and attempt API calls
   */
  private validate(): void {
    /**
     * If you're seeing this, bring it up to Abhi. This has debt
     * since it needs custom error types to remove dependence on
     * error message strings
     */
    if (!genericContentTypes.includes(this.contentType)) {
      throw new Error('NotGenericContentTypeError');
    }
    if (JSON.stringify(this.data).length >= MESSAGE_DATA_MAX_LENGTH) {
      throw new Error('MessageDataTooBigError');
    }
  }
  private async setDisappearing() {
    if (!genericDisappearingTypes.includes(this.contentType)) {
      return;
    }
    this.expiresOn = generateExpiresOnISOTimestamp(
      (await getChatPermissions(this.chatId, ChatType.direct))
        .disappearingMessages,
    );
    this.savedMessage.expiresOn = this.expiresOn;
    this.payload.expiresOn = this.expiresOn;
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
      if (!(await this.isAuthenticated())) {
        console.warn(
          '[SendPlaintextDirectMessage] tried sending message when unauthenticated. Journalling',
        );
        return false;
      }
      await this.loadSavedMessage();
      console.log('Attempting to send: ', this.data);
      const processedPayload = await this.encryptedMessage();
      // Perform API call

      const udpatedStatus = await API.sendObject(
        this.chatId,
        processedPayload,
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

  private async onFailure(error: any = null) {
    this.updateConnectionInfo(MessageStatus.failed);
    storage.updateMessageSendStatus(this.chatId, {
      messageIdToBeUpdated: this.messageId,
      updatedMessageStatus: MessageStatus.failed,
    });
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
      //example if content type is text
      case ContentType.text:
        text = (this.data as TextParams).text;
        break;
      case ContentType.link:
        text = (this.data as LinkParams).text;
        break;
      case ContentType.contactBundle:
        text =
          'shared contact of ' + (this.data as ContactBundleParams).bundle.name;
        break;
      default:
        break;
    }
    if (!connectionUpdateExemptTypes.includes(this.contentType)) {
      console.log('updating connection', this.contentType);
      await updateConnectionOnNewMessage({
        chatId: this.chatId,
        text,
        readStatus: readStatus,
        recentMessageType: this.contentType,
        latestMessageId: this.messageId,
      });
    }
  }
}
