import GroupReceiveAction from '../GroupReceiveAction';
import {updateConnection} from '@utils/Connections';

class RemoveSelf extends GroupReceiveAction {
  async performAction(): Promise<void> {
    await updateConnection({chatId: this.chatId, disconnected: true});
  }
}

export default RemoveSelf;
