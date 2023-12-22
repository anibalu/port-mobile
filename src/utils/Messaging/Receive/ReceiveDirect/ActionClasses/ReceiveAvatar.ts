import {DisplayAvatarParams} from '@utils/Messaging/interfaces';
import DirectReceiveAction from '../DirectReceiveAction';
import {updateConnection} from '@utils/Connections';

class ReceiveAvatar extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //save message to storage
    await this.saveMessage();
    //update connection
    await updateConnection({
      chatId: this.chatId,
      pathToDisplayPic: (
        this.decryptedMessageContent.data as DisplayAvatarParams
      ).fileUri,
    });
  }
}

export default ReceiveAvatar;
