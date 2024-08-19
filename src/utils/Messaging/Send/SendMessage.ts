import {isGroupChat} from '@utils/Storage/connections';
import {generateRandomHexId} from '@utils/IdGenerator';
import {
  ContentType,
  DataType,
  MessageDataTypeBasedOnContentType,
} from '../interfaces';
import {retryDirect, sendDirect} from './SendDirectMessage';

class SendMessage<T extends ContentType> {
  private chatId: string; //chatId of chat
  private contentType: ContentType; //contentType of message
  private data: DataType; //message data corresponding to the content type
  private replyId: string | null; //not null if message is a reply message (optional)
  private messageId: string; //messageId of message (optional)

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
  }

  //only public function. Handles lifecycle of send operation.
  public async send(
    _journal: boolean = true,
    _shouldEncrypt: boolean = true,
    onUpdateSuccess?: (x: boolean) => void,
  ) {
    const isGroup = await isGroupChat(this.chatId);
    if (isGroup) {
      // const sender = new SendGroupMessage(
      //   this.chatId,
      //   this.contentType,
      //   this.data,
      //   this.replyId,
      //   this.messageId,
      // );
      // await sender.send(journal, shouldEncrypt, onUpdateSuccess);
    } else {
      await sendDirect(
        this.chatId,
        this.contentType,
        this.data,
        this.replyId,
        this.messageId,
        onUpdateSuccess,
      );
    }
  }

  public async retry(onUpdateSuccess?: (x: boolean) => void) {
    const isGroup = await isGroupChat(this.chatId);
    if (isGroup) {
      // const sender = new SendGroupMessage(
      //   this.chatId,
      //   this.contentType,
      //   this.data,
      //   this.replyId,
      //   this.messageId,
      // );
      // await sender.send(journal, shouldEncrypt, onUpdateSuccess);
    } else {
      await retryDirect(
        this.chatId,
        this.contentType,
        this.data,
        this.replyId,
        this.messageId,
        onUpdateSuccess,
      );
    }
  }
}

export default SendMessage;
