import {MESSAGE_DATA_MAX_LENGTH} from '@configs/constants';

import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';
import {generateRandomHexId} from '@utils/IdGenerator';
import {
  ContentType,
  DataType,
  MessageDataTypeBasedOnContentType,
  MessageStatus,
  PayloadMessageParams,
} from '@utils/Messaging/interfaces';
import {getConnection, updateConnection} from '@utils/Storage/connections';
import {LineMessageData} from '@utils/Storage/DBCalls/lineMessage';
import * as storage from '@utils/Storage/messages';
import {generateISOTimeStamp} from '@utils/Time';

import * as API from '../../APICalls';

import {SendDirectMessage} from './AbstractSender';


export const editedMessageTypes: ContentType[] = [ContentType.editedMessage];

/**
 * This sender first gets the editedMessage and messageIdToEdit and updates the original message
 * using updateMessageData util.
 * Once the message has been edited, we want to clean up our db by deleting this message.
 * We also wanna be mindful of updatingconnection info when we edit messages. If older messages
 * are edited, we want to use getConnectionTextByContentType to get the latest message. Otherwise
 * we show our latest edited message.
 */
export class SendEditedMessage<
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
    if (!editedMessageTypes.includes(this.contentType)) {
      throw new Error('NotEditContentTypeError');
    }
    //throw error if message exceeds acceptable character size
    if (JSON.stringify(this.data).length >= MESSAGE_DATA_MAX_LENGTH) {
      throw new Error('MessageDataTooBigError');
    }
  }

  async send(_onSuccess?: (x: boolean) => void): Promise<boolean> {
    try {
      this.validate();
      try {
        const editedText = this.savedMessage.data.editedText;
        const messageIdToEdit = this.savedMessage.data.messageIdToEdit;
        await storage.updateMessageData(this.chatId, messageIdToEdit, {
          text: editedText,
          messageIdToEdit: messageIdToEdit,
        });
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
   * Reconstruct saved message and payload from db.
   */
  private async loadSavedMessage() {
    const savedMessage = await storage.getMessage(this.chatId, this.messageId);
    if (!savedMessage) {
      throw Error('MessageNotFound');
    }
    const editedText = this.savedMessage.data.editedText;
    const messageIdToEdit = this.savedMessage.data.messageIdToEdit;
    await storage.updateMessageData(this.chatId, messageIdToEdit, {
      text: editedText,
      messageIdToEdit: messageIdToEdit,
    });
    const finalEditedMessage = await storage.getMessage(
      this.chatId,
      messageIdToEdit,
    );
    this.savedMessage = savedMessage;
    this.payload = {
      messageId: savedMessage.messageId,
      contentType: this.contentType,
      data: finalEditedMessage?.data,
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
      await this.updateConnectionInfo();
      if (sendStatus === MessageStatus.sent) {
        //clean up by deleting saved edited message if successfully sent
        await this.cleanup();
      }
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
      console.log('send attempt failed, message to be journaled');
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
    await this.updateConnectionInfo();
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
    await storage.permanentlyDeleteMessage(this.chatId, this.messageId);
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
  private async updateConnectionInfo() {
    const connection = await getConnection(this.chatId);
    const latestMessage = await storage.getMessage(
      this.chatId,
      connection.latestMessageId || '',
    );
    if (latestMessage) {
      //if latest message exists, use its attributes
      await updateConnection({
        chatId: this.chatId,
        text: getConnectionTextByContentType(
          latestMessage.contentType,
          latestMessage.data,
        ),
        recentMessageType: latestMessage.contentType,
        readStatus: latestMessage.messageStatus,
        timestamp: latestMessage.timestamp,
      });
    } else {
      //else, set connection text to empty
      await updateConnection({
        chatId: this.chatId,
        text: '',
      });
    }
  }
}
