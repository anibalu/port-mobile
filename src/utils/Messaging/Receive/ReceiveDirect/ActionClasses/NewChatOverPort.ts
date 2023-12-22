import DirectReceiveAction from '../DirectReceiveAction';
import {handshakeActionsA1} from '@utils/DirectChats/handshake';

class NewChatOverPort extends DirectReceiveAction {
  async performAction(): Promise<void> {
    await handshakeActionsA1(this.chatId, this.message.lineLinkId);
  }
}

export default NewChatOverPort;
