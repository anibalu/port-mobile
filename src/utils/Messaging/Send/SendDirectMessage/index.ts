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
  SendDeleteDirectMessage,
  deleteContentTypes,
} from './senders/DeletionSender';
import {ContentType, DataType} from '@utils/Messaging/interfaces';
import {
  SendReactionDirectMessage,
  reactionContentTypes,
} from './senders/ReactionSender';
import {
  SendReceiptDirectMessage,
  receiptContentTypes,
} from './senders/ReceiptSender';
import {
  contactBundleContentTypes,
  SendContactBundleDirectMessage,
} from './senders/ContactBundleSender';
import {
  SendContactRequestDirectMessage,
  contactBundleRequestContentTypes,
} from './senders/ContactRequestSender';

function assignSenderClass(contentType: ContentType) {
  let SenderClass = null;
  if (genericContentTypes.includes(contentType)) {
    SenderClass = SendGenericDirectMessage;
  }
  if (contactBundleContentTypes.includes(contentType)) {
    SenderClass = SendContactBundleDirectMessage;
  }
  if (contactBundleRequestContentTypes.includes(contentType)) {
    SenderClass = SendContactRequestDirectMessage;
  }
  if (deleteContentTypes.includes(contentType)) {
    SenderClass = SendDeleteDirectMessage;
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
  return SenderClass;
}

export async function sendDirect(
  chatId: string,
  contentType: ContentType,
  data: DataType,
  replyId: string | null,
  messageId: string,
  _onSuccess?: (success: boolean) => void,
) {
  let SenderClass = assignSenderClass(contentType);
  if (SenderClass) {
    let sender = new SenderClass(chatId, contentType, data, replyId, messageId);
    await sender.send();
    return;
  }
  console.error(
    `Could not find a suitible SenderClass for contentType: ${contentType}`,
  );
}

export async function retryDirect(
  chatId: string,
  contentType: ContentType,
  data: DataType,
  replyId: string | null,
  messageId: string,
  _onSuccess?: (success: boolean) => void,
) {
  let SenderClass = assignSenderClass(contentType);
  if (SenderClass) {
    let sender = new SenderClass(chatId, contentType, data, replyId, messageId);
    await sender.retry();
    return;
  }
  console.error(
    `Could not find a suitible SenderClass for contentType: ${contentType}`,
  );
}
