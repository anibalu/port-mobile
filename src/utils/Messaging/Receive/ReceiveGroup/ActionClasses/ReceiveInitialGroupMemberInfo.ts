import Group from '@utils/Groups/Group';
import GroupReceiveAction from '../GroupReceiveAction';
import {GroupInitialMemberInfoParams} from '@utils/Messaging/interfaces';

class ReceiveInitialGroupMemberInfo extends GroupReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const senderName = (
      this.decryptedMessageContent.data as GroupInitialMemberInfoParams
    ).senderName;
    const members = (
      this.decryptedMessageContent.data as GroupInitialMemberInfoParams
    ).members;
    const chat = new Group(this.chatId);
    const chatData = await chat.getData();
    await chat.updateMemberContactData(this.senderId, {name: senderName});
    if (chatData && !chatData.initialMemberInfoReceived) {
      for (let index = 0; index < members.length; index++) {
        await chat.updateMemberContactData(members[index].memberId, {
          name: members[index].name,
        });
      }
      await chat.updateData({initialMemberInfoReceived: true});
    }
  }
}

export default ReceiveInitialGroupMemberInfo;
