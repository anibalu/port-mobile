import {SendMediaDirectMessage, mediaContentTypes} from './senders/MediaSender';
import {
  SendGenericDirectMessage,
  genericContentTypes,
} from './senders/GenericSender';
import {
  SendPlaintextDirectMessage,
  plaintextContentTypes,
} from './senders/PlaintextSender';
import {
  SendUpdateDirectMessage,
  updateContentTypes,
} from './senders/UpdateSender';
import {SendDirectMessage} from './senders/AbstractSender';
import {ContentType, DataType} from '@utils/Messaging/interfaces';
import {
  SendReactionDirectMessage,
  reactionContentTypes,
} from './senders/ReactionSender';
import {
  SendReceiptDirectMessage,
  receiptContentTypes,
} from './senders/ReceiptSender';

export async function sendDirect(
  chatId: string,
  contentType: ContentType,
  data: DataType,
  replyId: string | null,
  messageId: string,
  _onSuccess?: (success: boolean) => void,
) {
  let SenderClass = null;
  if (genericContentTypes.includes(contentType)) {
    SenderClass = SendGenericDirectMessage;
  }
  if (updateContentTypes.includes(contentType)) {
    SenderClass = SendUpdateDirectMessage;
  }
  if (receiptContentTypes.includes(contentType)) {
    SenderClass = SendReceiptDirectMessage;
  }
  if (reactionContentTypes.includes(contentType)) {
    SenderClass = SendReactionDirectMessage;
  }
  if (mediaContentTypes.includes(contentType)) {
    SenderClass = SendMediaDirectMessage;
  }
  if (plaintextContentTypes.includes(contentType)) {
    SenderClass = SendPlaintextDirectMessage;
  }
  if (SenderClass) {
    // await SenderClass.send(onSuccess);
    let sender: SendDirectMessage = new SenderClass(
      chatId,
      contentType,
      data,
      replyId,
      messageId,
    );
    sender.send();
    return;
  }
  console.error(
    `Could not find a suitible SenderClass for contentType: ${contentType}`,
  );
}
