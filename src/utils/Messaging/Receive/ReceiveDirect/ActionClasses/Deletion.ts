import DirectChat from '@utils/DirectChats/DirectChat';

import DirectReceiveAction from '../DirectReceiveAction';

class Deletion extends DirectReceiveAction {
  generatePreviewText(): string {
    return '';
  }
  async performAction(): Promise<void> {
    const chatHandler = new DirectChat(this.chatId);
    //we only need to disconnect locally as disconnection message is coming from the server.
    await chatHandler.disconnect(this.lineId, true);
  }
}

export default Deletion;
