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
import ReceiveDisplayImage from './ActionClasses/ReceiveDisplayImage';
import ReceiveFile from './ActionClasses/ReceiveFile';
import ReceiveImage from './ActionClasses/ReceiveImage';
import ReceiveName from './ActionClasses/ReceiveName';
import ReceiveReaction from './ActionClasses/ReceiveReaction';
import ReceiveText from './ActionClasses/ReceiveText';
import ReceiveLink from './ActionClasses/ReceiveLink';
import ReceiveAudio from './ActionClasses/ReceiveAudio';
import ReceiveVideo from './ActionClasses/ReceiveVideo';
import DirectReceiveAction from './DirectReceiveAction';
import ReceiveReceipt from './ActionClasses/ReceiveReceipt';
import ReceiveMessageDeletion from './ActionClasses/ReceiveMessageDeletion';
import ReceiveDisappearingMessage from './ActionClasses/ReceiveDisappearingMessage';

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
  [ContentType.handshakeA1]: HandshakeResponseA1,
  [ContentType.handshakeB2]: HandshakeResponseB2,
  [ContentType.initialInfoRequest]: InitialInfoResponse,
  [ContentType.contactBundle]: ReceiveContactBundle,
  [ContentType.contactBundleRequest]: ReceiveContactBundleRequest,
  [ContentType.contactBundleResponse]: ReceiveContactBundleResponse,
};

export async function directReceiveActionPicker(
  chatId: string,
  message: any,
  receiveTime: string,
  decryptedMessageContent: PayloadMessageParams | null = null,
): Promise<DirectReceiveAction | null> {
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
    if (
      SupportedReceieveDecryptedContentTypes.includes(
        decryptedMessageContent.contentType,
      )
    ) {
      return new AssignDecryptedContentReceiver[
        decryptedMessageContent.contentType as keyof typeof AssignDecryptedContentReceiver
      ](chatId, message, receiveTime, decryptedMessageContent);
    }
  }
  return null;
}
