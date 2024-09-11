import GroupReceiveAction from '../GroupReceiveAction';
import {DEFAULT_GROUP_MEMBER_NAME} from '@configs/constants';
import Group from '@utils/Groups/Group';

class RemoveMember extends GroupReceiveAction {
  async performAction(): Promise<void> {
    const removedMember = this.content.removedMember || this.content.memberLeft;
    if (!removedMember) {
      throw new Error('NoRemovedMemberId');
    }
    const removedMemberId = removedMember as string;
    const groupHandler = new Group(this.chatId);
    const removedMemberInfo = await groupHandler.getMember(removedMemberId);
    if (!removedMemberInfo) {
      throw new Error('NoSuchMember');
    }
    await groupHandler.markMemberRemoved(removedMemberId);
    await this.saveInfoMessage(
      `${
        removedMemberInfo.name || DEFAULT_GROUP_MEMBER_NAME
      } is no longer in the group`,
    );
  }
}

export default RemoveMember;
