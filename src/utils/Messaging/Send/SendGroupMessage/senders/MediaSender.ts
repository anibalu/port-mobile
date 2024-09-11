import {
  ContentType,
  DataType,
  LargeDataParams,
  LargeDataParamsStrict,
  MessageDataTypeBasedOnContentType,
  MessageStatus,
  PayloadMessageParams,
  connectionUpdateTypes,
} from '@utils/Messaging/interfaces';
import * as storage from '@utils/Storage/groupMessages';
import {SendGroupMessage} from './AbstractSender';
import {generateRandomHexId} from '@utils/IdGenerator';
import {generateExpiresOnISOTimestamp, generateISOTimeStamp} from '@utils/Time';
import {MESSAGE_DATA_MAX_LENGTH} from '@configs/constants';
import * as API from '../../APICalls';
import {ChatType} from '@utils/Storage/DBCalls/connections';
import {
  checkFileSizeWithinLimits,
  moveToLargeFileDir,
} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import LargeDataUpload from '@utils/Messaging/LargeData/LargeDataUpload';
import {saveNewMedia, updateMedia} from '@utils/Storage/media';
import {updateConnectionOnNewMessage} from '@utils/Storage/connections';
import {getChatPermissions} from '@utils/ChatPermissions';
import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';
import {GroupMessageData} from '@utils/Storage/DBCalls/groupMessage';

/**
 * Content types that trigger this sender
 */
export const mediaContentTypes: ContentType[] = [
  ContentType.image,
  ContentType.video,
  ContentType.file,
  ContentType.displayImage,
  ContentType.audioRecording,
];

/**
 * Subset content types that support disappearing messages
 */
const disappearingMediaTypes: ContentType[] = [
  ContentType.image,
  ContentType.video,
  ContentType.file,
];

/**
 * Subset content types that don't need an entry in the media db or a local copy of the media.
 */
const localMediaCopyExemptTypes: ContentType[] = [ContentType.displayImage];

//IMPORTANT: Assumes that the file Uri of the media about to be sent is located in the tmp directory.
export class SendMediaGroupMessage<
  T extends ContentType,
> extends SendGroupMessage<T> {
  chatId: string; //chatId of chat
  contentType: ContentType; //contentType of message
  data: DataType; //message data corresponding to the content type
  replyId: string | null; //not null if message is a reply message (optional)
  messageId: string; //messageId of message (optional)
  savedMessage: GroupMessageData; //message to be saved to storage
  payload: PayloadMessageParams; //message to be encrypted and sent.
  expiresOn: string | null;
  constructor(
    chatId: string,
    type: T,
    data: MessageDataTypeBasedOnContentType<T>,
    replyId: string | null = null,
    messageId: string = generateRandomHexId(),
    singleRecipient: string | null | undefined = null,
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
      singleRecepient: singleRecipient,
      //initial state is unsent
      messageStatus: MessageStatus.unsent,
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

  private async validate(): Promise<void> {
    //throw error if content type is not supported by this class
    if (!mediaContentTypes.includes(this.contentType)) {
      throw new Error('NotMediaContentTypeError');
    }
    //throw error if message exceeds acceptable character size
    if (JSON.stringify(this.data).length >= MESSAGE_DATA_MAX_LENGTH) {
      throw new Error('MessageDataTooBigError');
    }
    //throw error if no media file uri is specified
    const fileUri = (this.data as LargeDataParams).fileUri;
    if (!fileUri) {
      throw new Error('LargeDataFileUriNullError');
    }
    //throw error if file is too large to send
    if (!(await checkFileSizeWithinLimits(fileUri))) {
      throw new Error('FileTooLarge');
    }
  }

  async send(_onSuccess?: (x: boolean) => void): Promise<boolean> {
    try {
      //we don't yet support sending media before a chat has been authenticated.
      if (!this.isAuthenticated()) {
        console.warn(
          '[SEND MEDIA DIRECT MESSAGE] Attempted to send before authentication. Failed.',
        );
        return false;
      }
      // Set up in Filesystem
      await this.validate();
      this.setDisappearing();

      //attempt to create upload media Id and key.
      await this.uploadMedia();
      //create local copy of media
      await this.addMediaEntry();

      //message is saved with appropriate message status (based on whether media upload failed or not).
      await storage.saveGroupMessage(this.savedMessage);

      //if upload has succeeded, try sending the message.
      if (this.savedMessage.messageStatus === MessageStatus.journaled) {
        //prep payload with upload mediaId and key
        //make fileUri and previewUri null as that information is useless to the receiver.
        this.payload.data = {
          ...this.data,
          fileUri: null,
          previewUri: null,
        };
        const processedData = await this.encryptedMessage();
        this.savedMessage.messageStatus = await this.attempt(processedData);
        // Update message's send status
        await storage.updateGroupMessageStatus(this.chatId, {
          messageIdToBeUpdated: this.messageId,
          updatedMessageStatus: this.savedMessage.messageStatus,
        });
      }
      // Update connection card's message
      await this.updateConnectionInfo(
        this.savedMessage.messageStatus as MessageStatus,
      );
    } catch (e) {
      console.error('Could not send message', e);
      await this.onFailure(e);
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
        true,
        this.isNotificationSilent(),
      );
      return MessageStatus.sent;
    } catch (error) {
      console.log(
        'send attempt failed, message type does not support journaling',
      );
      return MessageStatus.journaled;
    }
  }

  /**
   * Retry sending media.
   * we can also call this if upload has failed to re-upload and send.
   * If upload has succeeded but send has failed, the journaled message is re-sent.
   */
  async retry(): Promise<boolean> {
    try {
      //load up saved message from storage
      await this.loadSavedMessage();
      //make sure re-upload is only called on unsent media messages
      if (this.savedMessage.messageStatus === MessageStatus.unsent) {
        //attempt to create upload media Id and key.
        await this.uploadMedia();
      }
      //we don't need to add media entry because it is already added on the initial send step.
      //if upload has succeeded, try sending the message.
      if (this.savedMessage.messageStatus === MessageStatus.journaled) {
        //prep payload with upload mediaId and key
        //make fileUri and previewUri null as that information is useless to the receiver.
        this.payload.data = {
          ...this.data,
          fileUri: null,
          previewUri: null,
        };
        const processedData = await this.encryptedMessage();
        this.savedMessage.messageStatus = await this.attempt(processedData);
        // Update message's send status
        await storage.updateGroupMessageStatus(this.chatId, {
          messageIdToBeUpdated: this.messageId,
          updatedMessageStatus: this.savedMessage.messageStatus,
        });
      }
      // Update connection card's message
      await this.updateConnectionInfo(
        this.savedMessage.messageStatus as MessageStatus,
      );
    } catch (e) {
      console.error('Could not send message', e);
      await this.onFailure(e);
      return false;
    }
    this.storeCalls();
    return true;
  }

  /**
   * Setup disappearing message supported types with expiry
   */
  private async setDisappearing() {
    if (disappearingMediaTypes.includes(this.contentType)) {
      this.expiresOn = generateExpiresOnISOTimestamp(
        (await getChatPermissions(this.chatId, ChatType.group))
          .disappearingMessages,
      );
      this.savedMessage.expiresOn = this.expiresOn;
      this.payload.expiresOn = this.expiresOn;
    }
  }

  /**
   * Reconstruct saved message and payload from db.
   */
  private async loadSavedMessage() {
    const savedMessage = await storage.getGroupMessage(
      this.chatId,
      this.messageId,
    );
    if (!savedMessage) {
      throw Error('MessageNotFound');
    }
    this.savedMessage = savedMessage;
    this.data = savedMessage.data;
    this.payload = {
      messageId: savedMessage.messageId,
      contentType: this.contentType,
      data: savedMessage.data,
      replyId: savedMessage.replyId,
      expiresOn: this.expiresOn,
    };
  }

  private async onFailure(error: any = null) {
    if (typeof error === 'object' && error.message === 'FileTooLarge') {
      throw new Error(error.message);
    }
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
  generatePreviewText(): string {
    const text = getConnectionTextByContentType(this.contentType, this.data);
    return text;
  }

  /**
   * Update connection with preview text and new send status.
   * Update only if content type is not exempt from triggering connection updates
   * @param newSendStatus
   */
  private async updateConnectionInfo(newSendStatus: MessageStatus) {
    //set the connection read status to failed if message status is unsent.
    //We do this to give additional feedback to user on home screen.
    const readStatus =
      newSendStatus === MessageStatus.unsent
        ? MessageStatus.failed
        : newSendStatus;
    if (connectionUpdateTypes.includes(this.contentType)) {
      await updateConnectionOnNewMessage({
        chatId: this.chatId,
        text: this.generatePreviewText(),
        readStatus: readStatus,
        recentMessageType: this.contentType,
        latestMessageId: this.messageId,
      });
    }
  }

  /**
   * upload media before sending.
   * If this step succeeds, an upload media Id is created and message status gets updated to journaled.
   * Otherwise, upload media Id remains null or undefined and message status gets updated to unsent.
   */
  private async uploadMedia() {
    const largeData = this.data as LargeDataParamsStrict;
    //if valid upload media Id and key don't exist,
    //then we need to re-upload to create a new valid media Id and key.
    if (!largeData.mediaId || !largeData.key) {
      const uploader = new LargeDataUpload(
        largeData.fileUri,
        largeData.fileName,
        largeData.fileType,
      );
      await uploader.upload();
      const newMediaIdAndKey = uploader.getMediaIdAndKey();
      largeData.mediaId = newMediaIdAndKey.mediaId;
      largeData.key = newMediaIdAndKey.key;
      console.log('[MediaSender] Uploaded media due to missing mediaId or key');
    } else {
      console.log('[MediaSender] Skipping upload');
    }
    //if re-upload succeeds and upload mediaId is created, let's mark the message status as journaled.
    if (largeData.mediaId) {
      this.savedMessage.messageStatus = MessageStatus.journaled;
    } else {
      //else let's mark the message status as unsent
      this.savedMessage.messageStatus = MessageStatus.unsent;
    }
  }

  /**
   * Creates local copy of media in media Dir and adds media entry to DB
   */
  private async addMediaEntry() {
    const largeData = this.data as LargeDataParamsStrict;
    //make a local copy and add to media DB. Unless it's exempt.
    if (!localMediaCopyExemptTypes.includes(this.contentType)) {
      //create a local copy in the chat's media directory
      const newLocation = await moveToLargeFileDir(
        this.chatId,
        largeData.fileUri,
        largeData.fileName,
        this.contentType,
        false,
      );
      //create a local copy of the media's preview in the chat's media directory.
      const newPreviewLocation = largeData.previewUri
        ? await moveToLargeFileDir(
            this.chatId,
            largeData.previewUri,
            null,
            this.contentType,
            false,
          )
        : undefined;
      largeData.fileUri = newLocation;
      largeData.previewUri = newPreviewLocation;

      //Add entry into media table
      const localMediaId = generateRandomHexId();
      await saveNewMedia(
        localMediaId,
        this.chatId,
        this.messageId,
        generateISOTimeStamp(),
      );
      //Saves relative URIs for the paths
      await updateMedia(localMediaId, {
        type: this.contentType,
        filePath: largeData.fileUri,
        name: largeData.fileName,
        previewPath: largeData.previewUri ? largeData.previewUri : undefined,
      });
      //update the savedMessage with local media Id.
      this.savedMessage.mediaId = localMediaId;
    }
  }
}
