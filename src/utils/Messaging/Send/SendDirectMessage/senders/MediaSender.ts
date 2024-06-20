import {
  ContentType,
  DataType,
  LargeDataParams,
  LargeDataParamsStrict,
  MessageDataTypeBasedOnContentType,
  MessageStatus,
  PayloadMessageParams,
  SavedMessageParams,
  connectionUpdateExemptTypes,
} from '@utils/Messaging/interfaces';
import * as storage from '@utils/Storage/messages';
import {SendDirectMessage} from './AbstractSender';
import {generateRandomHexId} from '@utils/IdGenerator';
import {generateExpiresOnISOTimestamp, generateISOTimeStamp} from '@utils/Time';
import {MESSAGE_DATA_MAX_LENGTH} from '@configs/constants';
import * as API from '../../APICalls';
import {ChatType, ReadStatus} from '@utils/Connections/interfaces';
import {
  checkFileSizeWithinLimits,
  moveToLargeFileDir,
} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import LargeDataUpload from '@utils/Messaging/LargeData/LargeDataUpload';
import {saveNewMedia, updateMedia} from '@utils/Storage/media';
import {updateConnectionOnNewMessage} from '@utils/Connections';
import {getChatPermissions} from '@utils/ChatPermissions';

export const mediaContentTypes: ContentType[] = [
  ContentType.image,
  ContentType.video,
  ContentType.file,
  ContentType.displayImage,
  ContentType.audioRecording,
];
const disappearingMediaTypes: ContentType[] = [
  ContentType.image,
  ContentType.video,
  ContentType.file,
];

//IMPORTANT: Assumes that the file Uri of the media about to be sent is located in the tmp directory.
export class SendMediaDirectMessage<
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
      await this.validate();
      if (!this.isAuthenticated()) {
        console.warn(
          '[SEND MEDIA DIRECT MESSAGE] Attempted to send before authentication. Failed.',
        );
        return false;
      }
      this.setDisappearing();
      await this.preProcessMedia();
      (this.payload.data as LargeDataParams).fileUri = null;
      await storage.saveMessage(this.savedMessage);
      this.storeCalls();
      const processedData = await this.encryptedMessage();

      const isAPISuccess = await API.sendObject(
        this.chatId,
        processedData,
        this.isNotificationSilent(),
      );
      let sendStatus: MessageStatus;
      if (isAPISuccess === MessageStatus.sent) {
        sendStatus = MessageStatus.sent;
      } else {
        sendStatus = MessageStatus.unsent;
      }
      // Update message's send status
      await storage.updateMessageSendStatus(this.chatId, {
        messageIdToBeUpdated: this.messageId,
        updatedMessageStatus: sendStatus,
      });

      // Update connection card's message
      await this.updateConnectionInfo(sendStatus);
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
    this.storeCalls();
    return true;
  }
  /**
   * Perform the initial DBCalls and attempt API calls
   */
  private async validate(): Promise<void> {
    if (!mediaContentTypes.includes(this.contentType)) {
      throw new Error('NotMediaContentTypeError');
    }
    if (JSON.stringify(this.data).length >= MESSAGE_DATA_MAX_LENGTH) {
      throw new Error('MessageDataTooBigError');
    }
    const fileUri = (this.data as LargeDataParams).fileUri;
    if (!fileUri) {
      throw new Error('LargeDataFileUriNullError');
    }
    if (
      !(await checkFileSizeWithinLimits(
        fileUri,
        this.contentType === ContentType.displayImage ? 'doc' : 'tmp',
      ))
    ) {
      throw new Error('FileTooLarge');
    }
  }

  /**
   * Set up attributes based on whether the message should disappear
   * @returns void
   */
  private async setDisappearing() {
    if (!disappearingMediaTypes.includes(this.contentType)) {
      return;
    }
    this.expiresOn = generateExpiresOnISOTimestamp(
      (await getChatPermissions(this.chatId, ChatType.direct))
        .disappearingMessages,
    );
    this.savedMessage.expiresOn = this.expiresOn;
    this.payload.expiresOn = this.expiresOn;
  }

  /**
   * Retry sending a unsent message using only API calls
   */
  async retry(_onSuccess?: (x: boolean) => void): Promise<boolean> {
    console.log('Attempted retry of media');
    try {
      await this.preProcessMedia();
      const processedData = await this.encryptedMessage();

      const sendStatus = await API.sendObject(
        this.chatId,
        processedData,
        false,
        false,
      );
      // Update message's send status
      await storage.updateMessageSendStatus(this.chatId, {
        messageIdToBeUpdated: this.messageId,
        updatedMessageStatus: sendStatus,
      });

      // Update connection card's message
      await this.updateConnectionInfo(sendStatus);
      console.log('Retry of media succeeded');
    } catch (e) {
      console.error('Could not send message', e);
      await this.onFailure(e);
      this.storeCalls();
      return false;
    }

    this.storeCalls();
    return true;
  }

  private async onFailure(error: any = null) {
    this.updateConnectionInfo(MessageStatus.failed);
    storage.updateMessageSendStatus(this.chatId, {
      messageIdToBeUpdated: this.messageId,
      updatedMessageStatus: MessageStatus.failed,
    });
    if (typeof error === 'object' && error.message === 'FileTooLarge') {
      throw new Error(error.message);
    }
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
      case ContentType.file:
        text = 'Sent a file';
        break;
      case ContentType.image:
        text = 'Sent an image';
        break;
      case ContentType.video:
        text = 'Sent a video';
        break;
      case ContentType.audioRecording:
        text = 'Sent an audio';
        break;
      default:
        break;
    }
    if (!connectionUpdateExemptTypes.includes(this.contentType)) {
      await updateConnectionOnNewMessage({
        chatId: this.chatId,
        text,
        readStatus: readStatus,
        recentMessageType: this.contentType,
        latestMessageId: this.messageId,
      });
    }
  }
  private async preProcessMedia() {
    //create valid media Id and key.
    let mediaId = (this.data as LargeDataParams).mediaId;
    let key = (this.data as LargeDataParams).key;
    const largeData = this.data as LargeDataParamsStrict;
    if (!mediaId || !key) {
      const uploader = new LargeDataUpload(
        largeData.fileUri,
        largeData.fileName,
        largeData.fileType,
        'tmp',
      );
      await uploader.upload();
      const newMediaIdAndKey = uploader.getMediaIdAndKey();
      mediaId = newMediaIdAndKey.mediaId;
      key = newMediaIdAndKey.key;
      console.log('[MediaSender] Uploaded media due to missing mediaId or key');
    } else {
      console.log('[MediaSender] Skipping upload');
    }

    //prep payload
    this.payload.data = {
      ...this.data,
      fileUri: null,
      mediaId: mediaId,
      key: key,
    };

    // when about to send multimedia, make a local copy and add to media DB. Unless it's a display picture.
    try {
      if (this.contentType !== ContentType.displayImage) {
        const newLocation = await moveToLargeFileDir(
          this.chatId,
          largeData.fileUri,
          largeData.fileName,
          this.contentType,
          false,
        );
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
        (this.savedMessage.data as LargeDataParamsStrict).fileUri = newLocation;
        (this.savedMessage.data as LargeDataParamsStrict).mediaId = mediaId;
        (this.savedMessage.data as LargeDataParamsStrict).previewUri =
          newPreviewLocation;
      }
      //Add entry into media table
      if (mediaId) {
        await saveNewMedia(
          mediaId,
          this.chatId,
          this.messageId,
          this.savedMessage.timestamp,
        );
        //Saves relative URIs for the paths
        await updateMedia(mediaId, {
          type: this.contentType,
          filePath: largeData.fileUri,
          name: largeData.fileName,
          previewPath: largeData.previewUri ? largeData.previewUri : undefined,
        });
      }
    } catch (e) {
      console.log('ERROR MAKING LOCAL COPY AND ADDING TO MEDIA DB: ', e);
    }
  }
}
