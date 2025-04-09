import {ContentType, PayloadMessageParams} from '@utils/Messaging/interfaces';

import Deletion from './ActionClasses/Deletion';
import InitialInfoResponse from './ActionClasses/InitialInfoResponse';
import NewChatOverContactPort from './ActionClasses/NewChatOverContactPort';
import NewChatOverPort from './ActionClasses/NewChatOverPort';
import NewChatOverSuperport from './ActionClasses/NewChatOverSuperport';
import ReceiveAudio from './ActionClasses/ReceiveAudio';
import ReceiveAvatar from './ActionClasses/ReceiveAvatar';
import ReceiveCall from './ActionClasses/ReceiveCall';
import ReceiveContactBundle from './ActionClasses/ReceiveContactBundle';
import ReceiveContactBundleRequest from './ActionClasses/ReceiveContactBundleRequest';
import ReceiveContactBundleResponse from './ActionClasses/ReceiveContactBundleResponse';
import ReceiveContactPortBundle from './ActionClasses/ReceiveContactPortBundle';
import ReceiveContactPortRequest from './ActionClasses/ReceiveContactPortRequest';
import ReceiveContactPortTicket from './ActionClasses/ReceiveContactPortTicket';
import ReceiveDisappearingMessage from './ActionClasses/ReceiveDisappearingMessage';
import ReceiveDisplayImage from './ActionClasses/ReceiveDisplayImage';
import ReceiveEditedMessage from './ActionClasses/ReceiveEditedMessage';
import ReceiveFile from './ActionClasses/ReceiveFile';
import ReceiveImage from './ActionClasses/ReceiveImage';
import ReceiveLink from './ActionClasses/ReceiveLink';
import ReceiveMessageDeletion from './ActionClasses/ReceiveMessageDeletion';
import ReceiveName from './ActionClasses/ReceiveName';
import ReceiveReaction from './ActionClasses/ReceiveReaction';
import ReceiveReceipt from './ActionClasses/ReceiveReceipt';
import ReceiveText from './ActionClasses/ReceiveText';
import ReceiveVideo from './ActionClasses/ReceiveVideo';
import DirectReceiveAction from './DirectReceiveAction';

const SupportedReceieveDecryptedContentTypes = [
  ContentType.name,
  ContentType.text,
  ContentType.image,
  ContentType.video,
  ContentType.file,
  ContentType.deleted,
  ContentType.disappearingMessages,
  ContentType.displayImage,
  ContentType.displayAvatar,
  ContentType.link,
  ContentType.audioRecording,
  ContentType.reaction,
  ContentType.receipt,
  ContentType.handshakeA1,
  ContentType.handshakeB2,
  ContentType.initialInfoRequest,
  ContentType.contactBundle,
  ContentType.contactBundleRequest,
  ContentType.contactBundleResponse,
  ContentType.contactPortBundle,
  ContentType.contactPortTicket,
  ContentType.contactPortRequest,
  ContentType.contactPortPermissionRequest,
  ContentType.editedMessage,
];

const AssignDecryptedContentReceiver: Record<
  number,
  typeof DirectReceiveAction
> = {
  [ContentType.name]: ReceiveName,
  [ContentType.text]: ReceiveText,
  [ContentType.image]: ReceiveImage,
  [ContentType.video]: ReceiveVideo,
  [ContentType.file]: ReceiveFile,
  [ContentType.deleted]: ReceiveMessageDeletion,
  [ContentType.disappearingMessages]: ReceiveDisappearingMessage,
  [ContentType.displayImage]: ReceiveDisplayImage,
  [ContentType.displayAvatar]: ReceiveAvatar,
  [ContentType.link]: ReceiveLink,
  [ContentType.audioRecording]: ReceiveAudio,
  [ContentType.reaction]: ReceiveReaction,
  [ContentType.receipt]: ReceiveReceipt,
  [ContentType.initialInfoRequest]: InitialInfoResponse,
  [ContentType.contactBundle]: ReceiveContactBundle,
  [ContentType.contactBundleRequest]: ReceiveContactBundleRequest,
  [ContentType.contactBundleResponse]: ReceiveContactBundleResponse,
  [ContentType.contactPortBundle]: ReceiveContactPortBundle,
  [ContentType.contactPortTicket]: ReceiveContactPortTicket,
  [ContentType.contactPortRequest]: ReceiveContactPortRequest,
  [ContentType.contactPortPermissionRequest]: ReceiveContactPortRequest,
  [ContentType.editedMessage]: ReceiveEditedMessage,
};

export async function pickDirectReceiveAction(
  chatId: string,
  lineId: string,
  message: any,
  receiveTime: string,
  decryptedMessageContent: PayloadMessageParams | null = null,
): Promise<DirectReceiveAction | null> {
  if (!message.messageContent && message.lineLinkId) {
    if (message.contactPortId && message.contactPortId !== 'None') {
      return new NewChatOverContactPort(
        chatId,
        lineId,
        message,
        receiveTime,
        decryptedMessageContent,
      );
    }
    if (message.superportId && message.superportId !== 'None') {
      return new NewChatOverSuperport(
        chatId,
        lineId,
        message,
        receiveTime,
        decryptedMessageContent,
      );
    }
    if (message.lineLinkId !== 'None') {
      return new NewChatOverPort(
        chatId,
        lineId,
        message,
        receiveTime,
        decryptedMessageContent,
      );
    }
  }
  if (message.deletion) {
    return new Deletion(
      chatId,
      lineId,
      message,
      receiveTime,
      decryptedMessageContent,
    );
  }
  if (message.callType && message.callType === 'line') {
    return new ReceiveCall(
      chatId,
      lineId,
      message,
      receiveTime,
      decryptedMessageContent,
    );
  }
  /**
   * These helpers use chatId instead of directly using lineId.
   */
  if (decryptedMessageContent) {
    if (
      SupportedReceieveDecryptedContentTypes.includes(
        decryptedMessageContent.contentType,
      )
    ) {
      return new AssignDecryptedContentReceiver[
        decryptedMessageContent.contentType as keyof typeof AssignDecryptedContentReceiver
      ](chatId, lineId, message, receiveTime, decryptedMessageContent);
    }
  }
  return null;
}
