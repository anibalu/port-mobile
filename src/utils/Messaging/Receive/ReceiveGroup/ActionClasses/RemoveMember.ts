import GroupReceiveAction from '../GroupReceiveAction';
import {DEFAULT_NAME} from '@configs/constants';
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
    await this.saveMessage({
      info: `${
        removedMemberInfo.name || DEFAULT_NAME
      } is no longer in the group`,
    });
    await groupHandler.markMemberRemoved(removedMemberId);
  }
}

export default RemoveMember;
