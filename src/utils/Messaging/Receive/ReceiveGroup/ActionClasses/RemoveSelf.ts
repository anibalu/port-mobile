import Group from '@utils/Groups/Group';
import GroupReceiveAction from '../GroupReceiveAction';

class RemoveSelf extends GroupReceiveAction {
  async performAction(): Promise<void> {
    const group = new Group(this.chatId);
    console.log('updating group as disconnected', this.chatId);
    await group.updateData({disconnected: true});
    console.log('updated group as disconnected');
  }
}

export default RemoveSelf;
