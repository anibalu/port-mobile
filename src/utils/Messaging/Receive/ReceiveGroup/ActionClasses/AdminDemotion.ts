import Group from '@utils/Groups/Group';

import GroupReceiveAction from '../GroupReceiveAction';

class AdminDemotion extends GroupReceiveAction {
  async performAction(): Promise<void> {
    const chat = new Group(this.chatId);
    await chat.updateData({amAdmin: false});
    await this.saveInfoMessage('You are no longer an admin');
  }
}

export default AdminDemotion;
