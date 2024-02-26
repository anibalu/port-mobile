import {ContentType, PayloadMessageParams} from '@utils/Messaging/interfaces';
import AddMember from './ActionClasses/AddMember';
import ReceiveFile from './ActionClasses/ReceiveFile';
import ReceiveName from './ActionClasses/ReceiveName';
import ReceiveText from './ActionClasses/ReceiveText';
import ReceiveVideo from './ActionClasses/ReceiveVideo';
import RemoveMember from './ActionClasses/RemoveMember';
import RemoveSelf from './ActionClasses/RemoveSelf';
import GroupReceiveAction from './GroupReceiveAction';
import ReceiveImage from './ActionClasses/ReceiveImage';
import ReceiveReaction from './ActionClasses/ReceiveReaction';
import ReceiveUpdate from './ActionClasses/ReceiveUpdate';

export enum PossibleGroupReceiveActions {
  addMember,
  removeMember,
  removeSelf,
  receiveName,
  receiveText,
  receiveImage,
  receiveVideo,
  receiveFile,
}

export async function groupReceiveActionPicker(
  chatId: string,
  senderId: string,
  message: any,
  receiveTime: string,
  content: any = null,
  decryptedMessageContent: PayloadMessageParams | null = null,
): Promise<GroupReceiveAction | null> {
  if (content) {
    if (content.newMember) {
      return new AddMember(
        chatId,
        senderId,
        message,
        receiveTime,
        content,
        decryptedMessageContent,
      );
    }
    if (content.removedMember || content.memberLeft) {
      return new RemoveMember(
        chatId,
        senderId,
        message,
        receiveTime,
        content,
        decryptedMessageContent,
      );
    }
    if (content.removedFromGroup) {
      return new RemoveSelf(
        chatId,
        senderId,
        message,
        receiveTime,
        content,
        decryptedMessageContent,
      );
    }
  }
  if (decryptedMessageContent) {
    switch (decryptedMessageContent.contentType) {
      case ContentType.name:
        return new ReceiveName(
          chatId,
          senderId,
          message,
          receiveTime,
          content,
          decryptedMessageContent,
        );
      case ContentType.text:
        return new ReceiveText(
          chatId,
          senderId,
          message,
          receiveTime,
          content,
          decryptedMessageContent,
        );
      case ContentType.image:
        return new ReceiveImage(
          chatId,
          senderId,
          message,
          receiveTime,
          content,
          decryptedMessageContent,
        );
      case ContentType.video:
        return new ReceiveVideo(
          chatId,
          senderId,
          message,
          receiveTime,
          content,
          decryptedMessageContent,
        );
      case ContentType.file:
        return new ReceiveFile(
          chatId,
          senderId,
          message,
          receiveTime,
          content,
          decryptedMessageContent,
        );
      case ContentType.reaction:
        return new ReceiveReaction(
          chatId,
          senderId,
          message,
          receiveTime,
          content,
          decryptedMessageContent,
        );
      case ContentType.update:
        return new ReceiveUpdate(
          chatId,
          senderId,
          message,
          receiveTime,
          content,
          decryptedMessageContent,
        );
      default:
        return null;
    }
  }
  return null;
}
