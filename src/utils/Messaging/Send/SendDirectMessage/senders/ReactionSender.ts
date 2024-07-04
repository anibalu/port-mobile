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
import {
  getConnection,
  updateConnection,
  updateConnectionOnNewMessage,
} from '@utils/Connections';
import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';

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

  generatePreviewText(): string {
    return '';
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
        this.isNotificationSilent(),
      );
      if (reactionData.messageId) {
        await this.updateConnectionInfo(newSendStatus);
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

  private async updateConnectionInfo(newSendStatus: MessageStatus) {
    let readStatus: MessageStatus = MessageStatus.failed;

    // Update readStatus and perform cleanup if the message is sent successfully
    if (newSendStatus === MessageStatus.sent) {
      readStatus = MessageStatus.sent;
      await this.cleanup();
    } else {
      return true;
    }

    const reactionData = this.data as ReactionParams;
    let timestampToSend = this.savedMessage.timestamp;

    // Fetch the current message to update its text based on the content type
    const currMessage = await MessageStorage.getMessage(
      reactionData.chatId,
      reactionData.messageId,
    );
    const text =
      currMessage &&
      getConnectionTextByContentType(currMessage.contentType, currMessage.data);

    // Construct the text to send based on the reaction
    let updatedText = `${
      reactionData.reaction !== ''
        ? 'You reacted ' + reactionData.reaction + ' to "' + text + '"'
        : ''
    }`;

    // If the message is marked as deleted for everyone, adjust content and timestamp
    if (reactionData.tombstone) {
      const connection = await getConnection(this.chatId);
      //get the latest message associated with chat
      const latestMessage = await MessageStorage.getMessage(
        this.chatId,
        connection.latestMessageId || '',
      );
      //if latest message id does not exist, update chat with empty text string
      if (!latestMessage) {
        await updateConnection({
          chatId: this.chatId,
          text: '',
        });
      } else {
        updatedText = getConnectionTextByContentType(
          latestMessage.contentType,
          latestMessage.data,
        ); // Update updatedText based on the latest message
        await updateConnection({
          chatId: this.chatId,
          text: updatedText,
          readStatus: latestMessage.messageStatus,
          recentMessageType: latestMessage.contentType,
          timestamp: latestMessage.timestamp,
        });
      }
    } else {
      //adds reaction text to chat tile
      await updateConnectionOnNewMessage({
        chatId: this.chatId,
        text: updatedText,
        readStatus: readStatus,
        recentMessageType: this.contentType,
        timestamp: timestampToSend,
      });
    }
  }
}
