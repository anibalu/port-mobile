import {ContentType, DataType} from '@utils/Messaging/interfaces';
import {
  genericContentTypes,
  SendGenericGroupMessage,
} from './senders/GenericSender';
import {mediaContentTypes, SendMediaGroupMessage} from './senders/MediaSender';
import {
  reactionContentTypes,
  SendReactionGroupMessage,
} from './senders/ReactionSender';
import {
  deleteContentTypes,
  SendDeleteGroupMessage,
} from './senders/DeletionSender';
import {
  SendEditedMessage,
  editedMessageTypes,
} from './senders/EditedMessageSender';

function assignSenderClass(contentType: ContentType) {
  let SenderClass = null;
  if (genericContentTypes.includes(contentType)) {
    SenderClass = SendGenericGroupMessage;
  }
  if (mediaContentTypes.includes(contentType)) {
    SenderClass = SendMediaGroupMessage;
  }
  if (reactionContentTypes.includes(contentType)) {
    SenderClass = SendReactionGroupMessage;
  }
  if (deleteContentTypes.includes(contentType)) {
    SenderClass = SendDeleteGroupMessage;
  }
  if (editedMessageTypes.includes(contentType)) {
    SenderClass = SendEditedMessage;
  }
  return SenderClass;
}

export async function sendGroup(
  chatId: string,
  contentType: ContentType,
  data: DataType,
  replyId: string | null,
  messageId: string,
  singleRecipient: string | null | undefined,
  _onSuccess?: (success: boolean) => void,
) {
  let SenderClass = assignSenderClass(contentType);
  if (SenderClass) {
    let sender = new SenderClass(
      chatId,
      contentType,
      data,
      replyId,
      messageId,
      singleRecipient,
    );
    await sender.send();
    return;
  }
  console.error(
    `Could not find a suitible SenderClass for contentType: ${contentType}`,
  );
}

export async function retryGroup(
  chatId: string,
  contentType: ContentType,
  data: DataType,
  replyId: string | null,
  messageId: string,
  singleRecipient: string | null | undefined,
  _onSuccess?: (success: boolean) => void,
) {
  let SenderClass = assignSenderClass(contentType);
  if (SenderClass) {
    let sender = new SenderClass(
      chatId,
      contentType,
      data,
      replyId,
      messageId,
      singleRecipient,
    );
    await sender.retry();
    return;
  }
  console.error(
    `Could not find a suitible SenderClass for contentType: ${contentType}`,
  );
}
