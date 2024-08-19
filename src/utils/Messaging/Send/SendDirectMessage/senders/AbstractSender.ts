import store from '@store/appStore';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import DirectChat from '@utils/DirectChats/DirectChat';
import {generateRandomHexId} from '@utils/IdGenerator';
import {
  ContentType,
  DataType,
  MessageDataTypeBasedOnContentType,
  MessageStatus,
  PayloadMessageParams,
} from '@utils/Messaging/interfaces';
import {LineMessageData} from '@utils/Storage/DBCalls/lineMessage';
import {generateISOTimeStamp} from '@utils/Time';

/**
 * Content types that should trigger push notifications.
 */
const notificationContentTypes: ContentType[] = [
  ContentType.text,
  ContentType.audioRecording,
  ContentType.file,
  ContentType.video,
  ContentType.image,
  ContentType.link,
  ContentType.contactBundleRequest,
  ContentType.contactBundle,
  ContentType.contactBundleDenialResponse,
  ContentType.contactBundleResponse,
  ContentType.reaction,
];

const storeCallsExemptContentTypes: ContentType[] = [
  ContentType.initialInfoRequest,
  ContentType.contactPortRequest,
];

/**
 * Entry point for sending messages on direct chats.
 */
export abstract class SendDirectMessage<T extends ContentType> {
  chatId: string; //chatId of chat
  contentType: ContentType; //contentType of message
  data: DataType; //message data corresponding to the content type
  replyId: string | null; //not null if message is a reply message (optional)
  messageId: string; //messageId of message (optional)
  savedMessage: LineMessageData; //message to be saved to storage
  payload: PayloadMessageParams; //message to be encrypted and sent.
  expiresOn: string | null;
  //construct the class.
  constructor(
    chatId: string,
    type: T,
    data: MessageDataTypeBasedOnContentType<T>,
    replyId: string | null = null,
    messageId: string = generateRandomHexId(),
  ) {
    if (type === null) {
      console.error('ContentType cannot be null');
      throw new Error('NullTypeError');
    }
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
   * Preview text that the connection needs to be updated with.
   * Return empty string if connection needs no preview text update.
   */
  abstract generatePreviewText(): string;

  /**
   * Perform the initial DBCalls and attempt API calls
   */
  abstract send(_onSuccess?: (x: boolean) => void): Promise<boolean>;

  /**
   * Retry sending a journalled message using only API calls
   */
  abstract retry(): Promise<boolean>;

  /**
   * Attempt to post processed payload.
   * Based on the success of the api call, return message status.
   * @param processedPayload
   */
  abstract attempt(processedPayload: object): Promise<MessageStatus>;

  /**
   * Check if direct chat is authenticated.
   * @returns boolean indicating authentication status.
   */
  async isAuthenticated() {
    const chat = new DirectChat(this.chatId);
    return (await chat.getChatData()).authenticated;
  }

  /**
   * Encrypts payload after converting payload to a plaintext string.
   * @returns object containing encrypted content
   */
  async encryptedMessage() {
    const plaintext = JSON.stringify(this.payload);
    const chat = new DirectChat(this.chatId);
    const chatData = await chat.getChatData();
    const cryptoDriver = new CryptoDriver(chatData.cryptoId);
    return {encryptedContent: await cryptoDriver.encrypt(plaintext)};
  }

  /**
   * Checks if the notification silencing flag needs to be added when payload is sent
   * @returns - boolean value indicating whether flag needs to be added.
   */
  isNotificationSilent(): boolean {
    return notificationContentTypes.includes(this.contentType) ? false : true;
  }

  /**
   * Triggers redraw
   * Please use this sparingly. Redraws are expensive and holds up the js thread.
   */
  storeCalls() {
    if (!storeCallsExemptContentTypes.includes(this.contentType)) {
      store.dispatch({
        type: 'PING',
        payload: 'PONG',
      });
    }
  }
}
