import GroupReceiveAction from '../GroupReceiveAction';
import {getMemberInfo, removeMember} from '@utils/Groups';
import {DEFAULT_NAME} from '@configs/constants';

class RemoveMember extends GroupReceiveAction {
  async performAction(): Promise<void> {
    const removedMember = this.content.removedMember || this.content.memberLeft;
    if (!removedMember) {
      throw new Error('NoRemovedMemberId');
    }
    const removedMemberId = removedMember as string;
    const removedMemberInfo = await getMemberInfo(this.chatId, removedMemberId);
    await this.saveMessage({
      info: `${
        removedMemberInfo.name || DEFAULT_NAME
      } is no longer in the group`,
    });
    await removeMember(this.chatId, removedMemberId);
  }
}

export default RemoveMember;
