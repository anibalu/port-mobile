import {DisplayAvatarParams} from '@utils/Messaging/interfaces';
import DirectReceiveAction from '../DirectReceiveAction';
import DirectChat from '@utils/DirectChats/DirectChat';
import {DEFAULT_AVATAR} from '@configs/constants';

class ReceiveAvatar extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //save message to storage
    await this.saveMessage();
    const chat = new DirectChat(this.chatId);
    await chat.updateDisplayPic(
      (this.decryptedMessageContent.data as DisplayAvatarParams).fileUri ||
        DEFAULT_AVATAR,
    );
  }
}

export default ReceiveAvatar;
