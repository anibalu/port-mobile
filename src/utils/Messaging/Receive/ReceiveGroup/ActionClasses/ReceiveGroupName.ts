import Group from '@utils/Groups/Group';
import GroupReceiveAction from '../GroupReceiveAction';
import {GroupNameParams} from '@utils/Messaging/interfaces';

class ReceiveGroupName extends GroupReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const chat = new Group(this.chatId);
    const member = await chat.getMember(this.senderId);
    if (
      member &&
      member.isAdmin &&
      (this.decryptedMessageContent.data as GroupNameParams).groupName
    ) {
      await chat.updateData({
        name: (this.decryptedMessageContent.data as GroupNameParams).groupName,
      });
    }
  }
}

export default ReceiveGroupName;
