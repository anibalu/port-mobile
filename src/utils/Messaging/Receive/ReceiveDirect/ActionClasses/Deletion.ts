import DirectChat from '@utils/DirectChats/DirectChat';
import DirectReceiveAction from '../DirectReceiveAction';
import {setConnectionDisconnected} from '@utils/Connections';

class Deletion extends DirectReceiveAction {
  async performAction(): Promise<void> {
    const chatHandler = new DirectChat(this.chatId);
    await chatHandler.updateChatData({disconnected: true});
    await setConnectionDisconnected(this.chatId);
  }
}

export default Deletion;
