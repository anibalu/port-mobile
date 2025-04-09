import {DEFAULT_AVATAR} from '@configs/constants';

import Group from '@utils/Groups/Group';
import {GroupAvatarParams} from '@utils/Messaging/interfaces';

import GroupReceiveAction from '../GroupReceiveAction';

class ReceiveGroupAvatar extends GroupReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const chat = new Group(this.chatId);
    const member = await chat.getMember(this.senderId);
    if (member && member.isAdmin) {
      //Avatars are saved as is since they are not relative URIs
      await chat.updateData({
        groupPicture:
          (this.decryptedMessageContent.data as GroupAvatarParams).fileUri ||
          DEFAULT_AVATAR,
      });
    }
  }
}

export default ReceiveGroupAvatar;
