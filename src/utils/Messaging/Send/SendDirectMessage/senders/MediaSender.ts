import {
  ContentType,
  DataType,
  LargeDataParams,
  LargeDataParamsStrict,
  MessageDataTypeBasedOnContentType,
  MessageStatus,
  PayloadMessageParams,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import * as storage from '@utils/Storage/messages';
import {SendDirectMessage} from './AbstractSender';
import {generateRandomHexId} from '@utils/IdGenerator';
import {generateExpiresOnISOTimestamp, generateISOTimeStamp} from '@utils/Time';
import {MESSAGE_DATA_MAX_LENGTH} from '@configs/constants';
import * as API from '../../APICalls';
import {ChatType, ReadStatus} from '@utils/Connections/interfaces';
import {checkFileSizeWithinLimits} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import LargeDataUpload from '@utils/Messaging/LargeData/LargeDataUpload';
import {saveNewMedia, updateMedia} from '@utils/Storage/media';
import {updateConnectionOnNewMessage} from '@utils/Connections';
import {getChatPermissions} from '@utils/ChatPermissions';

export const mediaContentTypes: ContentType[] = [
  ContentType.image,
  ContentType.video,
  ContentType.file,
  ContentType.displayImage,
];
const disappearingMediaTypes: ContentType[] = [
  ContentType.image,
  ContentType.video,
  ContentType.file,
];

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
      this.setDisappearing();
      await this.preProcessMedia();
      await storage.saveMessage(this.savedMessage);
      this.storeCalls();
      const processedData = await this.encryedtMessage();
      const sendStatus = await API.sendObject(
        this.chatId,
        processedData,
        false,
      );
      // Update message's send status
      await storage.updateMessageSendStatus(this.chatId, {
        messageIdToBeUpdated: this.messageId,
        updatedMessageStatus: sendStatus,
      });
      // Update connection card's message
      await this.updateConnectionInfo(sendStatus);
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
    this.storeCalls();
    return true;
  }
  /**
   * Perform the initial DBCalls and attempt API calls
   */
  private async validate(): Promise<void> {
    try {
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
      if (!(await checkFileSizeWithinLimits(fileUri))) {
        throw new Error('FileTooLarge');
      }
    } catch (error) {
      console.error('Error found in initial checks: ', error);
      throw new Error('InitialChecksError');
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
   * Retry sending a journalled message using only API calls
   */
  async retry(): Promise<boolean> {
    /**
     * Retries with images are not currently supported,
     * so simply mark message as failed
     */
    console.error('Attempted retry of media');
    // TODO
    await this.onFailure();
    return false;
  }

  private async onFailure() {
    this.updateConnectionInfo(MessageStatus.failed);
    storage.updateMessageSendStatus(this.chatId, {
      messageIdToBeUpdated: this.messageId,
      updatedMessageStatus: MessageStatus.failed,
    });
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
  private async preProcessMedia() {
    //create valid media Id and key.
    const largeData = this.data as LargeDataParamsStrict;
    const uploader = new LargeDataUpload(
      largeData.fileUri,
      largeData.fileName,
      largeData.fileType,
    );
    await uploader.upload();
    const newMediaIdAndKey = uploader.getMediaIdAndKey();

    //Add entry into media table
    await saveNewMedia(
      newMediaIdAndKey.mediaId,
      this.chatId,
      this.messageId,
      this.savedMessage.timestamp,
    );

    //prep payload
    this.payload.data = {
      ...this.data,
      fileUri: null,
      mediaId: newMediaIdAndKey.mediaId,
      key: newMediaIdAndKey.key,
    };

    //Saves relative URIs for the paths
    await updateMedia(newMediaIdAndKey.mediaId, {
      type: this.contentType,
      filePath: largeData.fileUri,
      name: largeData.fileName,
      previewPath:
        this.contentType === ContentType.video
          ? largeData.previewUri || undefined
          : undefined,
    });
  }
}
