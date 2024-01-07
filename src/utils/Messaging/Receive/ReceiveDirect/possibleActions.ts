import {
  HandshakeResponseA1,
  HandshakeResponseB2,
} from './ActionClasses/HandshakeResponse';
import NewChatOverPort from './ActionClasses/NewChatOverPort';
import NewChatOverSuperport from './ActionClasses/NewChatOverSuperport';
import ReceiveAvatar from './ActionClasses/ReceiveAvatar';
import ReceiveDisplayImage from './ActionClasses/ReceiveDisplayImage';
import ReceiveFile from './ActionClasses/ReceiveFile';
import ReceiveImage from './ActionClasses/ReceiveImage';
import ReceiveText from './ActionClasses/ReceiveText';
import ReceiveVideo from './ActionClasses/ReceiveVideo';
import Deletion from './ActionClasses/Deletion';
import ReceiveName from './ActionClasses/ReceiveName';
import DirectReceiveAction from './DirectReceiveAction';
import {ContentType, PayloadMessageParams} from '@utils/Messaging/interfaces';
import InitialInfoResponse from './ActionClasses/InitialInfoResponse';
import ReceiveContactBundleRequest from './ActionClasses/ReceiveContactBundleRequest';
import ReceiveContactBundleResponseDenial from './ActionClasses/ReceiveContactBundleResponseDenial';
import ReceiveContactBundleResponse from './ActionClasses/ReceiveContactBundleResponse';
import ReceiveContactBundle from './ActionClasses/ReceiveContactBundle';

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
  handshakeResponseA1,
  handshakeResponseB2,
  InitialInfoResponse,
  contactBundleRequest,
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
      default:
        return null;
    }
  }
  return null;
}
