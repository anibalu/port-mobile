import DirectChat from '@utils/DirectChats/DirectChat';

import DirectReceiveAction from '../DirectReceiveAction';

class Deletion extends DirectReceiveAction {
  generatePreviewText(): string {
    return '';
  }
  async performAction(): Promise<void> {
    //we only need to disconnect locally as disconnection message is coming from the server.
    await DirectChat.cleanDisconnectLine(this.lineId, true);
  }
}

export default Deletion;
