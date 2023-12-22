import DirectReceiveAction from '../DirectReceiveAction';
import {updateConnection} from '@utils/Connections';

class Deletion extends DirectReceiveAction {
  async performAction(): Promise<void> {
    await updateConnection({chatId: this.chatId, disconnected: true});
  }
}

export default Deletion;
