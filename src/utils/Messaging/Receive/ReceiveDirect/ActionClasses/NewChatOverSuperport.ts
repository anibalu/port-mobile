import DirectReceiveAction from '../DirectReceiveAction';
import {handshakeActionsA1} from '@utils/DirectChats/handshake';

class NewChatOverSuperport extends DirectReceiveAction {
  async performAction(): Promise<void> {
    await handshakeActionsA1(this.chatId, this.message.superportId);
  }
}

export default NewChatOverSuperport;
