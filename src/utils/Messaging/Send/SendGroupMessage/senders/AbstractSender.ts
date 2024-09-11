import {multiEncryptWithX25519SharedSecrets} from '@numberless/react-native-numberless-crypto';
import store from '@store/appStore';
import Group from '@utils/Groups/Group';
import {generateRandomHexId} from '@utils/IdGenerator';
import {
  ContentType,
  DataType,
  MessageDataTypeBasedOnContentType,
  MessageStatus,
  PayloadMessageParams,
} from '@utils/Messaging/interfaces';
import {GroupMessageData} from '@utils/Storage/DBCalls/groupMessage';
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
  ContentType.reaction,
];

const storeCallsExemptContentTypes: ContentType[] = [];

/**
 * Entry point for sending messages on direct chats.
 */
export abstract class SendGroupMessage<T extends ContentType> {
  chatId: string; //chatId of chat
  contentType: ContentType; //contentType of message
  data: DataType; //message data corresponding to the content type
  replyId: string | null; //not null if message is a reply message (optional)
  messageId: string; //messageId of message (optional)
  savedMessage: GroupMessageData; //message to be saved to storage
  payload: PayloadMessageParams; //message to be encrypted and sent.
  expiresOn: string | null;
  //construct the class.
  constructor(
    chatId: string,
    type: T,
    data: MessageDataTypeBasedOnContentType<T>,
    replyId: string | null = null,
    messageId: string = generateRandomHexId(),
    singleRecipient: string | null | undefined = null,
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
      singleRecepient: singleRecipient,
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
    const chat = new Group(this.chatId);
    const chatData = await chat.getData();
    if (chatData) {
      return !chatData.disconnected;
    } else {
      return false;
    }
  }

  /**
   * Encrypts payload after converting payload to a plaintext string.
   * @returns object containing encrypted content
   */
  async encryptedMessage(): Promise<object> {
    const group = new Group(this.chatId);
    const plaintext = JSON.stringify(this.payload);
    const memberAndKeyPairs = await group.loadGroupCryptoPairs();
    if (this.savedMessage.singleRecepient) {
      const recipientPair = memberAndKeyPairs.filter(
        item => item[0] === this.savedMessage.singleRecepient,
      );
      return await multiEncryptWithX25519SharedSecrets(
        plaintext,
        recipientPair,
      );
    }
    return await multiEncryptWithX25519SharedSecrets(
      plaintext,
      memberAndKeyPairs,
    );
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
