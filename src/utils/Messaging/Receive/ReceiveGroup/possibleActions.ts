import {ContentType, PayloadMessageParams} from '@utils/Messaging/interfaces';

import AddMember from './ActionClasses/AddMember';
import AdminDemotion from './ActionClasses/AdminDemotion';
import AdminPromotion from './ActionClasses/AdminPromotion';
import DemoteMember from './ActionClasses/DemoteMember';
import PromoteMember from './ActionClasses/PromoteMember';
import ReceiveAudio from './ActionClasses/ReceiveAudio';
import ReceiveEditedMessage from './ActionClasses/ReceiveEditedMessage';
import ReceiveFile from './ActionClasses/ReceiveFile';
import ReceiveGroupAvatar from './ActionClasses/ReceiveGroupAvatar';
import ReceiveGroupDescription from './ActionClasses/ReceiveGroupDescription';
import ReceiveGroupName from './ActionClasses/ReceiveGroupName';
import ReceiveGroupPicture from './ActionClasses/ReceiveGroupPicture';
import ReceiveImage from './ActionClasses/ReceiveImage';
import ReceiveInitialGroupMemberInfo from './ActionClasses/ReceiveInitialGroupMemberInfo';
import ReceiveLink from './ActionClasses/ReceiveLink';
import ReceiveMemberAvatar from './ActionClasses/ReceiveMemberAvatar';
import ReceiveMemberPicture from './ActionClasses/ReceiveMemberPicture';
import ReceiveMessageDeletion from './ActionClasses/ReceiveMessageDeletion';
import ReceiveName from './ActionClasses/ReceiveName';
import ReceiveReaction from './ActionClasses/ReceiveReaction';
import ReceiveText from './ActionClasses/ReceiveText';
import ReceiveVideo from './ActionClasses/ReceiveVideo';
import RemoveMember from './ActionClasses/RemoveMember';
import RemoveSelf from './ActionClasses/RemoveSelf';
import GroupReceiveAction from './GroupReceiveAction';

const SupportedReceieveDecryptedContentTypes = [
  ContentType.name,
  ContentType.text,
  ContentType.image,
  ContentType.video,
  ContentType.file,
  ContentType.groupAvatar,
  ContentType.groupPicture,
  ContentType.displayImage,
  ContentType.displayAvatar,
  ContentType.link,
  ContentType.audioRecording,
  ContentType.reaction,
  ContentType.groupName,
  ContentType.groupDescription,
  ContentType.deleted,
  ContentType.groupInitialMemberInfo,
  ContentType.editedMessage,
];
const AssignDecryptedContentReceiver: Record<
  number,
  typeof GroupReceiveAction
> = {
  [ContentType.name]: ReceiveName,
  [ContentType.text]: ReceiveText,
  [ContentType.image]: ReceiveImage,
  [ContentType.video]: ReceiveVideo,
  [ContentType.file]: ReceiveFile,
  [ContentType.link]: ReceiveLink,
  [ContentType.audioRecording]: ReceiveAudio,
  [ContentType.groupAvatar]: ReceiveGroupAvatar,
  [ContentType.groupPicture]: ReceiveGroupPicture,
  [ContentType.displayImage]: ReceiveMemberPicture,
  [ContentType.displayAvatar]: ReceiveMemberAvatar,
  [ContentType.reaction]: ReceiveReaction,
  [ContentType.groupName]: ReceiveGroupName,
  [ContentType.groupDescription]: ReceiveGroupDescription,
  [ContentType.deleted]: ReceiveMessageDeletion,
  [ContentType.groupInitialMemberInfo]: ReceiveInitialGroupMemberInfo,
  [ContentType.editedMessage]: ReceiveEditedMessage,
};

export async function groupReceiveActionPicker(
  chatId: string,
  groupId: string,
  senderId: string | null,
  message: any,
  receiveTime: string,
  content: any = null,
  decryptedMessageContent: PayloadMessageParams | null = null,
): Promise<GroupReceiveAction | null> {
  if (message.removedFromGroup) {
    return new RemoveSelf(
      chatId,
      groupId,
      senderId || '',
      message,
      receiveTime,
      content,
      decryptedMessageContent,
    );
  }
  if (content) {
    let AssignedClass: typeof GroupReceiveAction | null = null;
    if (content.newMember) {
      AssignedClass = AddMember;
    } else if (content.removedMember || content.memberLeft) {
      AssignedClass = RemoveMember;
    } else if (content.demotion) {
      AssignedClass = AdminDemotion;
    } else if (content.promotion) {
      AssignedClass = AdminPromotion;
    } else if (content.demotedMember) {
      AssignedClass = DemoteMember;
    } else if (content.promotedMember) {
      AssignedClass = PromoteMember;
    }
    if (AssignedClass !== null) {
      return new AssignedClass(
        chatId,
        groupId,
        senderId || '',
        message,
        receiveTime,
        content,
        decryptedMessageContent,
      );
    }
  }
  if (decryptedMessageContent) {
    if (
      SupportedReceieveDecryptedContentTypes.includes(
        decryptedMessageContent.contentType,
      ) &&
      senderId &&
      senderId !== ''
    ) {
      return new AssignDecryptedContentReceiver[
        decryptedMessageContent.contentType as keyof typeof AssignDecryptedContentReceiver
      ](
        chatId,
        groupId,
        senderId,
        message,
        receiveTime,
        content,
        decryptedMessageContent,
      );
    }
  }
  return null;
}
