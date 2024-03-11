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
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import {generateISOTimeStamp} from '@utils/Time';

export abstract class SendDirectMessage<T extends ContentType | null> {
  chatId: string; //chatId of chat
  contentType: ContentType; //contentType of message
  data: DataType; //message data corresponding to the content type
  replyId: string | null; //not null if message is a reply message (optional)
  messageId: string; //messageId of message (optional)
  savedMessage: SavedMessageParams; //message to be saved to storage
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
   * Perform the initial DBCalls and attempt API calls
   */
  abstract send(_onSuccess?: (x: boolean) => void): Promise<boolean>;

  /**
   * Retry sending a journalled message using only API calls
   */
  abstract retry(): Promise<boolean>;

  async encryedtMessage() {
    const plaintext = JSON.stringify(this.payload);
    const chat = new DirectChat(this.chatId);
    const chatData = await chat.getChatData();
    const cryptoDriver = new CryptoDriver(chatData.cryptoId);
    return {encryptedContent: await cryptoDriver.encrypt(plaintext)};
  }
  storeCalls() {
    store.dispatch({
      type: 'PING',
      payload: 'PONG',
    });
  }
}
