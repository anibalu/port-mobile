import GroupReceiveAction from '../GroupReceiveAction';
import {updateConnection} from '@utils/Storage/connections';

class RemoveSelf extends GroupReceiveAction {
  async performAction(): Promise<void> {
    await updateConnection({chatId: this.chatId, disconnected: true});
  }
}

export default RemoveSelf;
