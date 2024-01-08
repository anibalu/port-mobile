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
import {moveToLargeFileDir} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import * as storage from '@utils/Storage/messages';
import {
  checkMediaIdAndKeyValidity,
  generateExpiresOnISOTimestamp,
  generateISOTimeStamp,
} from '@utils/Time';
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
import {uploadLargeFile} from '../LargeData/largeData';
import * as API from './APICalls';
import {getChatPermissions} from '@utils/ChatPermissions';

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
      this.validateMessage();
      //pre-process message appropriately.
      await this.preProcessMessage(journal);
      //get processed payload that can be sent.
      const processedPayload = await this.processPayload(shouldEncrypt);
      //try sending encrypted payload
      const newSendStatus = await this.trySending(processedPayload);
      //post-process large data message to update new data and timestamp in storage.
      await this.postProcessLargeDataMessage(newSendStatus);
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
  private validateMessage() {
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
        if (!(this.data as LargeDataParams).fileUri) {
          throw new Error('LargeDataFileUriNullError');
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
    const isLargeDataMessage = this.isLargeDataMessage();
    if (isLargeDataMessage) {
      await this.preProcessLargeDataMessage(journal);
    } else {
      //save message to storage if journaling is on
      await this.saveMessage(journal);
    }
  }
  //we would like this process to:
  //1. ensure large data file is in local chat storage
  //2. valid media Id and key are part of message data
  //3. payload is prepped properly to be encrypted and sent
  private async preProcessLargeDataMessage(journal: boolean) {
    const isLargeDataMessage = this.isLargeDataMessage();
    //only run if message is large data message
    if (isLargeDataMessage) {
      const largeData = this.data as LargeDataParamsStrict;
      if (largeData.mediaId && largeData.key) {
        //if media Id and key exist:
        //1. make sure they are still valid
        //2. If not valid, create valid media Id and key again.
        await this.saveMessage(journal);
        if (!checkMediaIdAndKeyValidity(this.savedMessage.timestamp)) {
          const newMediaIdAndKey = await uploadLargeFile(largeData.fileUri);
          largeData.mediaId = newMediaIdAndKey.mediaId;
          largeData.key = newMediaIdAndKey.key;
        }
      } else {
        //if media Id and key don't exist:
        //1. create a copy of file in chat storage and save message if journal is ON
        const localCopyPath = await moveToLargeFileDir(
          this.chatId,
          largeData.fileUri,
          largeData.fileName,
          this.contentType,
        );
        largeData.fileUri = localCopyPath;
        this.data = {...this.data, ...largeData};
        this.savedMessage.data = this.data;
        await this.saveMessage(journal);
        //2. create valid media Id and key.
        const newMediaIdAndKey = await uploadLargeFile(largeData.fileUri);
        largeData.mediaId = newMediaIdAndKey.mediaId;
        largeData.key = newMediaIdAndKey.key;
      }
      //data now contains valid local fileUri, mediaId and key
      this.data = {...this.data, ...largeData};
      //update saved message
      this.savedMessage.data = this.data;
      this.savedMessage.timestamp = generateISOTimeStamp();
      //prep payload
      this.payload.data = {
        ...(this.data as LargeDataParams),
        ...this.data,
        fileUri: null,
      };
    }
  }

  //We would like this process to:
  //1. If new send status is journaled, update stored message data so it contains latest media Id and key.
  //2. otherwise, update stored message data so it doesn't contain a media Id and key.
  private async postProcessLargeDataMessage(newSendStatus: MessageStatus) {
    const isLargeDataMessage = this.isLargeDataMessage();
    //only run if message is large data message
    if (isLargeDataMessage) {
      if (newSendStatus === MessageStatus.journaled) {
        await storage.updateMessage(this.chatId, this.messageId, this.data);
      } else {
        await storage.updateMessage(this.chatId, this.messageId, {
          ...this.data,
          mediaId: null,
          key: null,
        });
      }
    }
  }

  //save message to storage
  private async saveMessage(shouldSave: boolean) {
    if (shouldSave) {
      //save message to storage with "unassigned" sendStatus
      await storage.saveMessage(this.savedMessage);
      //update redux store that a new message will be sent
      store.dispatch({
        type: 'NEW_SENT_MESSAGE',
        payload: this.payload,
      });
    }
  }

  //update message send status
  private async updateSendStatus(newSendStatus: MessageStatus) {
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
          text: 'sent image: ' + (this.data as LargeDataParams).text || '',
          readStatus: readStatus,
          recentMessageType: this.contentType,
        });
        break;
      case ContentType.video:
        await updateConnectionOnNewMessage({
          chatId: this.chatId,
          text: 'sent video: ' + (this.data as LargeDataParams).text || '',
          readStatus: readStatus,
          recentMessageType: this.contentType,
        });
        break;
      case ContentType.file:
        await updateConnectionOnNewMessage({
          chatId: this.chatId,
          text: 'sent file: ' + (this.data as LargeDataParams).text || '',
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
