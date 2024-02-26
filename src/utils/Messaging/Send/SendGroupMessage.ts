/**
 * A class responsible for managing message send operations.
 * The class is strictly typed so that a contentType accepts only its relevant data type.
 */
import {MESSAGE_DATA_MAX_LENGTH} from '@configs/constants';
import {multiEncryptWithX25519SharedSecrets} from '@numberless/react-native-numberless-crypto';
import store from '@store/appStore';
import {getChatPermissions} from '@utils/ChatPermissions';
import {updateConnectionOnNewMessage} from '@utils/Connections';
import {ChatType, ReadStatus} from '@utils/Connections/interfaces';
import Group from '@utils/Groups/Group';
import {generateRandomHexId} from '@utils/IdGenerator';
import {checkFileSizeWithinLimits} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {saveNewMedia, updateMedia} from '@utils/Storage/media';
import * as storage from '@utils/Storage/messages';
import {generateExpiresOnISOTimestamp, generateISOTimeStamp} from '@utils/Time';
import LargeDataUpload from '../LargeData/LargeDataUpload';
import {
  ContactBundleParams,
  ContentType,
  DataType,
  DisappearMessageExemptContentTypes,
  LargeDataMessageContentTypes,
  LargeDataParams,
  LargeDataParamsStrict,
  MessageDataTypeBasedOnContentType,
  MessageStatus,
  PayloadMessageParams,
  SavedMessageParams,
  TextParams,
  UpdateParams,
} from '../interfaces';
import * as API from './APICalls';

class SendGroupMessage<T extends ContentType> {
  private chatId: string; //chatId of chat
  private contentType: ContentType; //contentType of message
  private data: DataType; //message data corresponding to the content type
  private replyId: string | null; //not null if message is a reply message (optional)
  private messageId: string; //messageId of message (optional)
  private savedMessage: SavedMessageParams; //message to be saved to storage
  private payload: PayloadMessageParams; //message to be encrypted and sent.
  private expiresOn: string | null;
  private recipientID: string | null;
  //construct the class.
  constructor(
    chatId: string,
    type: T,
    data: MessageDataTypeBasedOnContentType<T>,
    replyId: string | null = null,
    messageId: string = generateRandomHexId(),
    recipientID: string | null = null,
  ) {
    this.chatId = chatId;
    this.contentType = type;
    this.data = data;
    this.messageId = messageId;
    this.replyId = replyId;
    this.recipientID = recipientID;
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
      recipientID: recipientID,
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

  //only public function. Handles lifecycle of send operation.
  public async send(
    journal: boolean = true,
    shouldEncrypt: boolean = true,
    onUpdateSuccess?: (x: boolean) => void,
  ) {
    if (this.contentType === ContentType.update) {
      await this.validateMessage();
      //pre-process message appropriately.
      await this.preProcessMessage(journal);
      //get processed payload that can be sent.
      const processedPayload = await this.processPayload(shouldEncrypt);

      //try sending encrypted payload
      const newSendStatus = await this.trySending(processedPayload);
      if (onUpdateSuccess) {
        if (newSendStatus >= MessageStatus.sent) {
          await this.handleUpdateContent(newSendStatus);
          await this.updateConnectionInfo(newSendStatus);
          onUpdateSuccess(true);
        } else {
          onUpdateSuccess(false);
        }
      }
    } else {
      try {
        //get expires on timestamp
        await this.getExpiresOnTimestamp();
        //load up saved message in storage if it exists
        await this.loadSavedMessage();
        //perform rudimentary checks before progressing further
        await this.validateMessage();
        //pre-process message appropriately.
        await this.preProcessMessage(journal);
        //get processed payload that can be sent.
        const processedPayload = await this.processPayload(shouldEncrypt);
        //try sending encrypted payload
        const newSendStatus = await this.trySending(processedPayload);
        //update status of message based on output of try sending operation
        await this.updateSendStatus(newSendStatus);
        //update connection with relevant information
        await this.updateConnectionInfo(newSendStatus);
      } catch (error) {
        await this.handleSendFailure(error);
      }
    }
  }

  //post request to API to send encrypted payload
  //return success/journaled based on post success/failure
  private async trySending(
    processedPayload: object,
  ): Promise<MessageStatus.sent | MessageStatus.journaled> {
    console.log('Payload is: ', processedPayload);
    return await API.sendObject(this.chatId, processedPayload, true);
  }

  /**
   * takes a payload and converts it to a string/encrypted string that can be sent.
   * @param shouldEncrypt - whether processed payload needs to be encrypted or not.
   */
  private async processPayload(shouldEncrypt: boolean): Promise<object> {
    const plaintext = JSON.stringify(this.payload);
    const group = new Group(this.chatId);

    const groupCryptoPairs = await group.loadGroupCryptoPairs();
    console.log('Pairs are: ', groupCryptoPairs);

    //TODO: Test this out, isnt tested
    if (this.recipientID) {
      const recipientPair = groupCryptoPairs.filter(
        item => item[0] === this.recipientID,
      );
      return shouldEncrypt
        ? await multiEncryptWithX25519SharedSecrets(plaintext, recipientPair)
        : {content: plaintext};
    }

    return shouldEncrypt
      ? await multiEncryptWithX25519SharedSecrets(plaintext, groupCryptoPairs)
      : {content: plaintext};
  }

  //load up saved message in storage if it exists
  private async loadSavedMessage() {
    const savedMessage = await storage.getMessage(this.chatId, this.messageId);
    if (savedMessage) {
      this.savedMessage = savedMessage as SavedMessageParams;
    }
  }

  //do rudimentary checks
  private async validateMessage() {
    try {
      if (this.savedMessage.messageStatus === MessageStatus.sent) {
        throw new Error('MessageAlreadySentError');
      }
      if (this.savedMessage.contentType !== this.contentType) {
        throw new Error('MessageContentTypeMismatchError');
      }
      if (JSON.stringify(this.data).length >= MESSAGE_DATA_MAX_LENGTH) {
        throw new Error('MessageDataTooBigError');
      }
      if (this.isLargeDataMessage()) {
        const fileUri = (this.data as LargeDataParams).fileUri;
        if (!fileUri) {
          throw new Error('LargeDataFileUriNullError');
        }
        if (!(await checkFileSizeWithinLimits(fileUri))) {
          throw new Error('FileTooLarge');
        }
      }
    } catch (error) {
      console.log('Error found in initial checks: ', error);
      throw new Error('InitialChecksError');
    }
  }

  //check if message is a large file message
  private isLargeDataMessage() {
    return LargeDataMessageContentTypes.includes(this.contentType);
  }
  private isExpiryExemptMessage() {
    return DisappearMessageExemptContentTypes.includes(this.contentType);
  }

  private async getExpiresOnTimestamp() {
    if (!this.isExpiryExemptMessage()) {
      const chatType = ChatType.group;
      const chatPermissions = await getChatPermissions(this.chatId, chatType);
      this.expiresOn = generateExpiresOnISOTimestamp(
        chatPermissions.disappearingMessages,
      );
      this.savedMessage.expiresOn = this.expiresOn;
      this.payload.expiresOn = this.expiresOn;
    }
  }

  private async preProcessMessage(journal: boolean) {
    //Update messages aren't saved to the DB to prevent unnecessary clutter.
    if (journal && this.savedMessage.contentType !== ContentType.update) {
      //save message to storage if journaling is on
      await this.saveMessage();
      //preprocesses large data message if message is large data message
      await this.preProcessLargeDataMessage();
    }
  }

  //we would like this process to:
  //1. valid media Id and key are part of message data
  //2. payload is prepped properly to be encrypted and sent
  private async preProcessLargeDataMessage() {
    const isLargeDataMessage = this.isLargeDataMessage();
    //only run if message is large data message
    if (isLargeDataMessage) {
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

      console.log('Saving path as: ', largeData.fileUri);

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

  //save message to storage
  private async saveMessage() {
    //save message to storage with "unassigned" messageStatus

    await storage.saveMessage(this.savedMessage);

    //update redux store that a new message will be sent
    store.dispatch({
      type: 'NEW_SENT_MESSAGE',
      payload: this.savedMessage,
    });
  }

  private async handleUpdateContent(newSendStatus: MessageStatus) {
    const msgTimestamp = generateISOTimeStamp();
    const deliveredAtTimestamp =
      newSendStatus === MessageStatus.sent ? msgTimestamp : undefined;
    await storage.updateMessageSendStatus(
      this.chatId,
      (this.data as UpdateParams).messageIdToBeUpdated,
      this.data as UpdateParams,
    );
    store.dispatch({
      type: 'NEW_SEND_STATUS_UPDATE',
      payload: {
        chatId: this.chatId,
        messageId: (this.data as UpdateParams).messageIdToBeUpdated,
        messageStatus: (this.data as UpdateParams).updatedMessageStatus,
        timestamp: msgTimestamp,
        deliveredTimestamp: deliveredAtTimestamp,
        shouldAck: (this.data as UpdateParams).shouldAck,
        ...((this.data as UpdateParams).updatedContentType && {
          contentType: (this.data as UpdateParams).updatedContentType,
        }),
      },
    });
  }

  //update message status. Can either be sent or journaled.
  private async updateSendStatus(newSendStatus: MessageStatus) {
    //Large data message cannot be journaled
    if (newSendStatus === MessageStatus.journaled) {
      if (this.isLargeDataMessage()) {
        throw new Error('LargeDataMessageCannotBeJournaled');
      }
    }
    const msgTimestamp = generateISOTimeStamp();

    const newUpdate: UpdateParams = {
      messageIdToBeUpdated: this.messageId,
      updatedMessageStatus: newSendStatus,
    };
    //update send status
    await storage.updateMessageSendStatus(this.chatId, newUpdate);

    //update redux store that a new message send status has changed.
    store.dispatch({
      type: 'NEW_SEND_STATUS_UPDATE',
      payload: {
        chatId: this.chatId,
        messageId: this.messageId,
        messageStatus: newSendStatus,
        timestamp: msgTimestamp,
      },
    });
  }

  //update message connection info based on send operation
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

    switch (this.contentType) {
      //example if content type is text
      case ContentType.text:
        await updateConnectionOnNewMessage({
          chatId: this.chatId,
          text: (this.data as TextParams).text,
          readStatus: readStatus,
          recentMessageType: this.contentType,
          latestMessageId: this.messageId,
        });
        break;
      case ContentType.image:
        await updateConnectionOnNewMessage({
          chatId: this.chatId,
          text:
            (this.data as LargeDataParams).text ||
            'sent image: ' + (this.data as LargeDataParams).fileName,
          readStatus: readStatus,
          recentMessageType: this.contentType,
          latestMessageId: this.messageId,
        });
        break;
      case ContentType.video:
        await updateConnectionOnNewMessage({
          chatId: this.chatId,
          text:
            (this.data as LargeDataParams).text ||
            'sent video: ' + (this.data as LargeDataParams).fileName,
          readStatus: readStatus,
          recentMessageType: this.contentType,
          latestMessageId: this.messageId,
        });
        break;
      case ContentType.file:
        await updateConnectionOnNewMessage({
          chatId: this.chatId,
          text:
            (this.data as LargeDataParams).text ||
            'sent file: ' + (this.data as LargeDataParams).fileName,
          readStatus: readStatus,
          recentMessageType: this.contentType,
          latestMessageId: this.messageId,
        });
        break;
      case ContentType.contactBundle:
        await updateConnectionOnNewMessage({
          chatId: this.chatId,
          text: 'shared contact of ' + (this.data as ContactBundleParams).name,
          readStatus: readStatus,
          recentMessageType: this.contentType,
          latestMessageId: this.messageId,
        });
        break;
      default:
        break;
    }
  }

  //handle failure of send operation
  private async handleSendFailure(sendError: any) {
    if (sendError.message !== 'InitialChecksError') {
      console.log('Error in send operation: ', sendError);
      try {
        //toggles stored message send status to failed.
        await this.updateSendStatus(MessageStatus.failed);
        await this.updateConnectionInfo(MessageStatus.failed);
      } catch (error) {
        console.log('Error handling send operation failure: ', error);
      }
    }
  }
}
export default SendGroupMessage;
