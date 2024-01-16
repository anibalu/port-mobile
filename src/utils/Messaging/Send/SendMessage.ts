/**
 * A class responsible for managing message send operations.
 * The class is strictly typed so that a contentType accepts only its relevant data type.
 */
import {MESSAGE_DATA_MAX_LENGTH} from '@configs/constants';
import store from '@store/appStore';
import {isGroupChat, updateConnectionOnNewMessage} from '@utils/Connections';
import {ChatType, ReadStatus} from '@utils/Connections/interfaces';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import DirectChat from '@utils/DirectChats/DirectChat';
import {generateRandomHexId} from '@utils/IdGenerator';
import {checkFileSizeWithinLimits} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import * as storage from '@utils/Storage/messages';
import {generateExpiresOnISOTimestamp, generateISOTimeStamp} from '@utils/Time';
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
} from '../interfaces';
import * as API from './APICalls';
import {getChatPermissions} from '@utils/ChatPermissions';
import LargeDataUpload from '../LargeData/LargeDataUpload';

class SendMessage<T extends ContentType> {
  private chatId: string; //chatId of chat
  private contentType: ContentType; //contentType of message
  private data: DataType; //message data corresponding to the content type
  private replyId: string | null; //not null if message is a reply message (optional)
  private messageId: string; //messageId of message (optional)
  private savedMessage: SavedMessageParams; //message to be saved to storage
  private payload: PayloadMessageParams; //message to be encrypted and sent.
  private isGroup: boolean; //whether chat is group or not.
  private expiresOn: string | null;
  //construct the class.
  constructor(
    chatId: string,
    type: T,
    data: MessageDataTypeBasedOnContentType<T>,
    replyId: string | null = null,
    messageId: string = generateRandomHexId(),
  ) {
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
    this.isGroup = false;
    this.expiresOn = null;
  }

  //only public function. Handles lifecycle of send operation.
  public async send(journal: boolean = true, shouldEncrypt: boolean = true) {
    try {
      //check if group
      this.isGroup = await isGroupChat(this.chatId);
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

  //post request to API to send encrypted payload
  //return success/journaled based on post success/failure
  private async trySending(
    processedPayload: object,
  ): Promise<MessageStatus.sent | MessageStatus.journaled> {
    return await API.sendObject(this.chatId, processedPayload, this.isGroup);
  }
  /**
   * takes a payload and converts it to a string/encrypted string that can be sent.
   * @param shouldEncrypt - whether processed payload needs to be encrypted or not.
   */
  private async processPayload(shouldEncrypt: boolean): Promise<object> {
    const plaintext = JSON.stringify(this.payload);
    if (!shouldEncrypt || this.isGroup) {
      return {content: plaintext};
    } else {
      const chat = new DirectChat(this.chatId);
      const chatData = await chat.getChatData();
      const cryptoDriver = new CryptoDriver(chatData.cryptoId);
      return {encryptedContent: await cryptoDriver.encrypt(plaintext)};
    }
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
      const chatType = this.isGroup ? ChatType.group : ChatType.direct;
      const chatPermissions = await getChatPermissions(this.chatId, chatType);
      this.expiresOn = generateExpiresOnISOTimestamp(
        chatPermissions.disappearingMessages,
      );
      this.savedMessage.expiresOn = this.expiresOn;
      this.payload.expiresOn = this.expiresOn;
    }
  }

  private async preProcessMessage(journal: boolean) {
    if (journal) {
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
      //prep payload
      this.payload.data = {
        ...this.data,
        fileUri: null,
        mediaId: newMediaIdAndKey.mediaId,
        key: newMediaIdAndKey.key,
      };
    }
  }

  //save message to storage
  private async saveMessage() {
    //save message to storage with "unassigned" sendStatus
    await storage.saveMessage(this.savedMessage);
    //update redux store that a new message will be sent
    store.dispatch({
      type: 'NEW_SENT_MESSAGE',
      payload: this.payload,
    });
  }

  //update message send status
  private async updateSendStatus(newSendStatus: MessageStatus) {
    //Large data message cannot be journaled
    if (newSendStatus === MessageStatus.journaled) {
      if (this.isLargeDataMessage()) {
        throw new Error('LargeDataMessageCannotBeJournaled');
      }
    }
    //update send status
    await storage.updateMessageSendStatus(
      this.chatId,
      this.messageId,
      newSendStatus,
    );
    //update redux store that a new message send status has changed
    store.dispatch({
      type: 'NEW_SEND_STATUS_UPDATE',
      payload: {
        chatId: this.chatId,
        messageId: this.messageId,
        sendStatus: newSendStatus,
        timestamp: generateISOTimeStamp(),
      },
    });
  }

  //update message connection info based on send operation
  private async updateConnectionInfo(newSendStatus: MessageStatus) {
    //create ReadStatus attribute based on send status.
    const readStatus: ReadStatus =
      newSendStatus === MessageStatus.sent
        ? ReadStatus.sent
        : ReadStatus.journaled;
    switch (this.contentType) {
      //example if content type is text
      case ContentType.text:
        await updateConnectionOnNewMessage({
          chatId: this.chatId,
          text: (this.data as TextParams).text,
          readStatus: readStatus,
          recentMessageType: this.contentType,
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
        });
        break;
      case ContentType.contactBundle:
        await updateConnectionOnNewMessage({
          chatId: this.chatId,
          text: 'shared contact of ' + (this.data as ContactBundleParams).name,
          readStatus: readStatus,
          recentMessageType: this.contentType,
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
      } catch (error) {
        console.log('Error handling send operation failure: ', error);
      }
    }
  }
}
export default SendMessage;
