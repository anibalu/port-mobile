import {ContentType, PayloadMessageParams} from '@utils/Messaging/interfaces';
import Deletion from './ActionClasses/Deletion';
import {
  HandshakeResponseA1,
  HandshakeResponseB2,
} from './ActionClasses/HandshakeResponse';
import InitialInfoResponse from './ActionClasses/InitialInfoResponse';
import NewChatOverPort from './ActionClasses/NewChatOverPort';
import NewChatOverSuperport from './ActionClasses/NewChatOverSuperport';
import ReceiveAvatar from './ActionClasses/ReceiveAvatar';
import ReceiveContactBundle from './ActionClasses/ReceiveContactBundle';
import ReceiveContactBundleRequest from './ActionClasses/ReceiveContactBundleRequest';
import ReceiveContactBundleResponse from './ActionClasses/ReceiveContactBundleResponse';
import ReceiveContactBundleResponseDenial from './ActionClasses/ReceiveContactBundleResponseDenial';
import ReceiveDisplayImage from './ActionClasses/ReceiveDisplayImage';
import ReceiveFile from './ActionClasses/ReceiveFile';
import ReceiveImage from './ActionClasses/ReceiveImage';
import ReceiveName from './ActionClasses/ReceiveName';
import ReceiveReaction from './ActionClasses/ReceiveReaction';
import ReceiveText from './ActionClasses/ReceiveText';
import ReceiveLink from './ActionClasses/ReceiveLink';
import ReceiveVideo from './ActionClasses/ReceiveVideo';
import DirectReceiveAction from './DirectReceiveAction';
import ReceiveReceipt from './ActionClasses/ReceiveReceipt';
import ReceiveMessageDeletion from './ActionClasses/ReceiveMessageDeletion';

export enum PossibleDirectReceiveActions {
  deletion,
  newChatOverPort,
  newChatOverSuperport,
  receiveName,
  receiveAvatar,
  receiveDisplayImage,
  receiveText,
  receiveImage,
  receiveVideo,
  receiveFile,
  receiveLink,
  handshakeResponseA1,
  handshakeResponseB2,
  InitialInfoResponse,
  contactBundleRequest,
  ReceiveContactBundle,
}

export async function directReceiveActionPicker(
  chatId: string,
  message: any,
  receiveTime: string,
  decryptedMessageContent: PayloadMessageParams | null = null,
): Promise<DirectReceiveAction | null> {
  //add conditions that make us call a class.
  //This kind of picker is not ideal interms of maintainability.
  if (message.deletion) {
    return new Deletion(chatId, message, receiveTime, decryptedMessageContent);
  }
  if (!message.messageContent && message.lineLinkId) {
    if (!message.superportId || message.superportId === 'None') {
      return new NewChatOverPort(
        chatId,
        message,
        receiveTime,
        decryptedMessageContent,
      );
    }
    if (message.superportId && message.superportId !== 'None') {
      return new NewChatOverSuperport(
        chatId,
        message,
        receiveTime,
        decryptedMessageContent,
      );
    }
  }
  if (decryptedMessageContent) {
    switch (decryptedMessageContent.contentType) {
      case ContentType.name:
        return new ReceiveName(
          chatId,
          message,
          receiveTime,
          decryptedMessageContent,
        );
      case ContentType.displayAvatar:
        return new ReceiveAvatar(
          chatId,
          message,
          receiveTime,
          decryptedMessageContent,
        );
      case ContentType.displayImage:
        return new ReceiveDisplayImage(
          chatId,
          message,
          receiveTime,
          decryptedMessageContent,
        );
      case ContentType.text:
        return new ReceiveText(
          chatId,
          message,
          receiveTime,
          decryptedMessageContent,
        );
      case ContentType.link:
        return new ReceiveLink(
          chatId,
          message,
          receiveTime,
          decryptedMessageContent,
        );
      case ContentType.image:
        return new ReceiveImage(
          chatId,
          message,
          receiveTime,
          decryptedMessageContent,
        );
      case ContentType.video:
        return new ReceiveVideo(
          chatId,
          message,
          receiveTime,
          decryptedMessageContent,
        );
      case ContentType.file:
        return new ReceiveFile(
          chatId,
          message,
          receiveTime,
          decryptedMessageContent,
        );
      case ContentType.handshakeA1:
        return new HandshakeResponseA1(
          chatId,
          message,
          receiveTime,
          decryptedMessageContent,
        );
      case ContentType.handshakeB2:
        return new HandshakeResponseB2(
          chatId,
          message,
          receiveTime,
          decryptedMessageContent,
        );
      case ContentType.initialInfoRequest:
        return new InitialInfoResponse(
          chatId,
          message,
          receiveTime,
          decryptedMessageContent,
        );
      case ContentType.contactBundleRequest:
        return new ReceiveContactBundleRequest(
          chatId,
          message,
          receiveTime,
          decryptedMessageContent,
        );
      case ContentType.deleted:
        return new ReceiveMessageDeletion(
          chatId,
          message,
          receiveTime,
          decryptedMessageContent,
        );
      case ContentType.contactBundleDenialResponse:
        return new ReceiveContactBundleResponseDenial(
          chatId,
          message,
          receiveTime,
          decryptedMessageContent,
        );
      case ContentType.contactBundleResponse:
        return new ReceiveContactBundleResponse(
          chatId,
          message,
          receiveTime,
          decryptedMessageContent,
        );
      case ContentType.contactBundle:
        return new ReceiveContactBundle(
          chatId,
          message,
          receiveTime,
          decryptedMessageContent,
        );
      case ContentType.reaction:
        return new ReceiveReaction(
          chatId,
          message,
          receiveTime,
          decryptedMessageContent,
        );
      case ContentType.receipt:
        return new ReceiveReceipt(
          chatId,
          message,
          receiveTime,
          decryptedMessageContent,
        );
      default:
        return null;
    }
  }
  return null;
}
