import {MESSAGE_DATA_MAX_LENGTH} from '@configs/constants';

import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';
import {generateRandomHexId} from '@utils/IdGenerator';
import {
  ContentType,
  DataType,
  MessageDataTypeBasedOnContentType,
  MessageStatus,
  PayloadMessageParams,
  ReactionParams,
  ReactionSender,
} from '@utils/Messaging/interfaces';
import {getConnection,updateConnection} from '@utils/Storage/connections';
import {LineMessageData} from '@utils/Storage/DBCalls/lineMessage';
import * as MessageStorage from '@utils/Storage/messages';
import * as ReactionStorage from '@utils/Storage/reactions';
import {generateISOTimeStamp} from '@utils/Time';

import * as API from '../../APICalls';

import {SendDirectMessage} from './AbstractSender';


/**
 * Content types that trigger this sender
 */
export const reactionContentTypes: ContentType[] = [ContentType.reaction];

export class SendReactionDirectMessage<
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
    try {
      //throw error if content type is not supported by this class
      if (!reactionContentTypes.includes(this.contentType)) {
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

  async send(_onUpdateSuccess?: (success: boolean) => void): Promise<boolean> {
    try {
      // Set up in Filesystem
      this.validate();
      try {
        //save message to storage
        await MessageStorage.saveMessage(this.savedMessage);
        //update reaction table
        await this.updateReactionInfo();
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
    this.retry();
    return true;
  }

  /**
   * Retry sending a journalled message using only API calls
   */
  async retry(): Promise<boolean> {
    try {
      console.log('retrying reaction journal');
      if (!(await this.isAuthenticated())) {
        console.warn(
          '[SEND REACTION DIRECT MESSAGE] Attempted to send before authentication. Failed.',
        );
        return false;
      }
      await this.loadSavedMessage();
      // Perform API call
      const processedPayload = await this.encryptedMessage();
      const newSendStatus = await this.attempt(processedPayload);
      // Update connection card's message
      await this.updateConnectionInfo(newSendStatus);
      if (newSendStatus === MessageStatus.sent) {
        //clean up by deleting saved reaction message if successfully sent
        await this.cleanup();
      }
    } catch (e) {
      console.error('Could not send message', e);
      await this.onFailure(e);
      this.storeCalls();
      return false;
    }
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
      console.log('send attempt failed, message journaled');
      return MessageStatus.journaled;
    }
  }

  /**
   * Reconstruct saved message and payload from db.
   */
  private async loadSavedMessage() {
    const savedMessage = await MessageStorage.getMessage(
      this.chatId,
      this.messageId,
    );
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
    this.data = this.savedMessage.data;
  }

  /**
   * Perform these actions on critical failures.
   */
  private async onFailure(e: any) {
    console.log('Could not send message', e);
    console.log('deleting reaction message:', this.chatId, this.messageId);
    try {
      //clean delete the reaction message
      await MessageStorage.cleanDeleteMessage(
        this.savedMessage.chatId,
        this.savedMessage.messageId,
        false,
      );
      //delete reaction entry
      await ReactionStorage.deleteReaction(
        this.chatId,
        this.savedMessage.data.messageId,
        ReactionSender.self,
      );
    } catch (error) {
      console.error('Error deleting reaction', error);
    }
  }

  /**
   * Perform necessary cleanup after sending succeeds
   */
  private async cleanup() {
    //delete reaction message from storage
    await MessageStorage.permanentlyDeleteMessage(this.chatId, this.messageId);
    return;
  }

  /**
   * Updates the reaction table of a new added or removed reaction.
   * Also sets the 'hasReaction' flag of the target message.
   */
  private async updateReactionInfo() {
    //set 'hasReaction' attibute of target message.
    const reactionData = this.data as ReactionParams;
    await MessageStorage.setHasReactions(this.chatId, reactionData.messageId);
    if (reactionData.tombstone) {
      ReactionStorage.deleteReaction(
        this.chatId,
        reactionData.messageId,
        ReactionSender.self,
      );
    } else {
      await ReactionStorage.addReaction(
        this.chatId,
        reactionData.messageId,
        ReactionSender.self,
        reactionData.reaction,
      );
    }
  }

  /**
   * Since reaction preview text is a complex construction, we don't do it using this method.
   * @returns empty string.
   */
  generatePreviewText(): string {
    return '';
  }

  /**
   * Update connection with preview text and new send status.
   * Update based on whether reaction is added or removed.
   */
  private async updateConnectionInfo(newSendStatus: MessageStatus) {
    const reactionData = this.data as ReactionParams;
    //If reaction is an "un-reaction", reset connection with attributes associated with latest message.
    if (reactionData.tombstone) {
      const connection = await getConnection(this.chatId);
      const latestMessage = await MessageStorage.getMessage(
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
    //Else, update connection with reaction text.
    else {
      // Fetch the target message of the reaction
      const targetMessage = await MessageStorage.getMessage(
        reactionData.chatId,
        reactionData.messageId,
      );
      const text =
        targetMessage &&
        getConnectionTextByContentType(
          targetMessage.contentType,
          targetMessage.data,
        );
      // Construct the text to update based on the reaction
      const updatedText =
        'You reacted ' + reactionData.reaction + ' to "' + text + '"';
      //update connection
      await updateConnection({
        chatId: this.chatId,
        text: updatedText,
        recentMessageType: ContentType.reaction,
        readStatus: newSendStatus,
      });
    }
  }
}
