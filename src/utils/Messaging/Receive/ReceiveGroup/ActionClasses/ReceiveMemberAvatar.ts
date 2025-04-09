import {DEFAULT_AVATAR} from '@configs/constants';

import Group from '@utils/Groups/Group';
import {GroupAvatarParams} from '@utils/Messaging/interfaces';

import GroupReceiveAction from '../GroupReceiveAction';

class ReceiveMemberAvatar extends GroupReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const chat = new Group(this.chatId);
    //Avatars are saved as is since they are not relative URIs
    await chat.updateMemberContactData(this.senderId, {
      displayPic:
        (this.decryptedMessageContent.data as GroupAvatarParams).fileUri ||
        DEFAULT_AVATAR,
    });
  }
}

export default ReceiveMemberAvatar;
