import {ContentType, DataType} from '@utils/Messaging/interfaces';

import {
  SendDeleteGroupMessage,
  deleteContentTypes,
} from './senders/DeletionSender';
import {
  SendEditedMessage,
  editedMessageTypes,
} from './senders/EditedMessageSender';
import {
  SendGenericGroupMessage,
  genericContentTypes,
} from './senders/GenericSender';
import {SendMediaGroupMessage, mediaContentTypes} from './senders/MediaSender';
import {
  SendReactionGroupMessage,
  reactionContentTypes,
} from './senders/ReactionSender';

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
  const SenderClass = assignSenderClass(contentType);
  if (SenderClass) {
    const sender = new SenderClass(
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
  const SenderClass = assignSenderClass(contentType);
  if (SenderClass) {
    const sender = new SenderClass(
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
