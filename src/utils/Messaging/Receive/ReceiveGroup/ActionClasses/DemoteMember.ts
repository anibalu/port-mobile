import {DEFAULT_GROUP_MEMBER_NAME} from '@configs/constants';

import Group from '@utils/Groups/Group';

import GroupReceiveAction from '../GroupReceiveAction';

class DemoteMember extends GroupReceiveAction {
  async performAction(): Promise<void> {
    const demotedMember = this.content.demotedMember as string;
    if (!demotedMember) {
      throw new Error('NoDemotedMemberId');
    }
    const groupHandler = new Group(this.chatId);
    const demotedMemberInfo = await groupHandler.getMember(demotedMember);
    if (!demotedMemberInfo) {
      throw new Error('NoSuchMember');
    }
    await groupHandler.updateMemberData(demotedMember, {isAdmin: false});
    await this.saveInfoMessage(
      `${
        demotedMemberInfo.name || DEFAULT_GROUP_MEMBER_NAME
      } was dismissed as an admin`,
    );
  }
}

export default DemoteMember;
