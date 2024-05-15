import {
  ContentType,
  DataType,
  LineReactionSender,
  MessageDataTypeBasedOnContentType,
  MessageStatus,
  PayloadMessageParams,
  ReactionParams,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import * as MessageStorage from '@utils/Storage/messages';
import * as ReactionStorage from '@utils/Storage/reactions';
import {SendDirectMessage} from './AbstractSender';
import {generateRandomHexId} from '@utils/IdGenerator';
import {generateISOTimeStamp} from '@utils/Time';
import {MESSAGE_DATA_MAX_LENGTH} from '@configs/constants';
import * as API from '../../APICalls';

export const reactionContentTypes: ContentType[] = [ContentType.reaction];

export class SendReactionDirectMessage<
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
  async send(_onUpdateSuccess?: (success: boolean) => void): Promise<boolean> {
    try {
      // Set up in Filesystem
      this.validate();
      // Set initial message statud
      this.savedMessage.messageStatus = MessageStatus.journaled;
      try {
        await MessageStorage.saveMessage(this.savedMessage);
        this.storeCalls();
      } catch {
        this.retry();
        return true;
      }
    } catch (e) {
      await this.onFailure(e);
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
      if (!(await this.isAuthenticated())) {
        console.warn(
          '[SEND REACTION DIRECT MESSAGE] Attempted to send before authentication. Failed.',
        );
        return false;
      }
      // await this.loadSavedMessage();
      console.log('Attempting to send: ', this.data);
      const reactionData = this.data as ReactionParams;
      await MessageStorage.setHasReactions(this.chatId, reactionData.messageId);
      if (reactionData.tombstone) {
        // TODO delete my reaction
        ReactionStorage.deleteReaction(
          this.chatId,
          reactionData.messageId,
          LineReactionSender.self,
        );
      } else {
        await ReactionStorage.addReaction(
          this.chatId,
          reactionData.messageId,
          LineReactionSender.self,
          reactionData.reaction,
        );
      }
      const processedPayload = await this.encryptedMessage();
      const newSendStatus = await API.sendObject(
        this.chatId,
        processedPayload,
        false,
      );
      if (newSendStatus === MessageStatus.sent) {
        await this.cleanup();
      } else {
        return true;
      }
    } catch (e) {
      console.error('Could not send message', e);
      await this.onFailure(e);
      this.storeCalls();
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
      if (!reactionContentTypes.includes(this.contentType)) {
        throw new Error('NotReactionContentTypeError');
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

  private async onFailure(e: any) {
    console.error('Could not send message', e);
    this.storeCalls();
    console.error('Cleaning message of info:', this.chatId, this.messageId);
    await this.cleanup();
  }

  /**
   * Perform necessary this. after sending succeeds
   */
  private async cleanup(): Promise<boolean> {
    try {
      await MessageStorage.cleanDeleteMessage(
        this.savedMessage.chatId,
        this.savedMessage.messageId,
        false,
      );
    } catch (e) {
      console.log('error cleaning up message', e);
    }

    return true;
  }
}
