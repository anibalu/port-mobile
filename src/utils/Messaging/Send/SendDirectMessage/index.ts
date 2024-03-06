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

export async function sendDirect(
  chatId: string,
  contentType: ContentType,
  data: DataType,
  replyId: string | null,
  messageId: string,
  onSuccess?: (success: boolean) => void,
) {
  let sender: SendDirectMessage<null> | null = null;
  if (genericContentTypes.includes(contentType)) {
    sender = new SendGenericDirectMessage(
      chatId,
      contentType,
      data,
      replyId,
      messageId,
    );
  }
  if (updateContentTypes.includes(contentType)) {
    sender = new SendUpdateDirectMessage(
      chatId,
      contentType,
      data,
      replyId,
      messageId,
    );
  }
  if (mediaContentTypes.includes(contentType)) {
    sender = new SendMediaDirectMessage(
      chatId,
      contentType,
      data,
      replyId,
      messageId,
    );
  }
  if (plaintextContentTypes.includes(contentType)) {
    sender = new SendPlaintextDirectMessage(
      chatId,
      contentType,
      data,
      replyId,
      messageId,
    );
  }
  if (sender) {
    await sender.send(onSuccess);
    return;
  }
  console.error(
    `Could not find a suitible sender for contentType: ${contentType}`,
  );
}
