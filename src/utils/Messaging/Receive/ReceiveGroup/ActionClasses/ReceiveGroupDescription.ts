import Group from '@utils/Groups/Group';
import {GroupDescriptionParams} from '@utils/Messaging/interfaces';

import GroupReceiveAction from '../GroupReceiveAction';

class ReceiveGroupDescription extends GroupReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const chat = new Group(this.chatId);
    const member = await chat.getMember(this.senderId);
    if (
      member &&
      member.isAdmin &&
      (this.decryptedMessageContent.data as GroupDescriptionParams)
        .groupDescription
    ) {
      await chat.updateData({
        description: (
          this.decryptedMessageContent.data as GroupDescriptionParams
        ).groupDescription,
      });
    }
  }
}

export default ReceiveGroupDescription;
