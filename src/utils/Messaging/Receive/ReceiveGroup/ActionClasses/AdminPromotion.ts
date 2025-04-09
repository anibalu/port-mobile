import Group from '@utils/Groups/Group';

import GroupReceiveAction from '../GroupReceiveAction';

class AdminPromotion extends GroupReceiveAction {
  async performAction(): Promise<void> {
    const chat = new Group(this.chatId);
    await chat.updateData({amAdmin: true});
    await this.saveInfoMessage('You were made an admin');
  }
}

export default AdminPromotion;
