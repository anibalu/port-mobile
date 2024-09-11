import GroupReceiveAction from '../GroupReceiveAction';
import {DEFAULT_GROUP_MEMBER_NAME} from '@configs/constants';
import Group from '@utils/Groups/Group';

class PromoteMember extends GroupReceiveAction {
  async performAction(): Promise<void> {
    const promotedMember = this.content.promotedMember as string;
    if (!promotedMember) {
      throw new Error('NoPromotedMemberId');
    }
    const groupHandler = new Group(this.chatId);
    const promotedMemberInfo = await groupHandler.getMember(promotedMember);
    if (!promotedMemberInfo) {
      throw new Error('NoSuchMember');
    }
    await groupHandler.updateMemberData(promotedMember, {isAdmin: true});
    await this.saveInfoMessage(
      `${
        promotedMemberInfo.name || DEFAULT_GROUP_MEMBER_NAME
      } was made an admin`,
    );
  }
}

export default PromoteMember;
