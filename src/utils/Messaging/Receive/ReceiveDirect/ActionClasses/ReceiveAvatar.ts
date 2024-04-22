import {DEFAULT_AVATAR} from '@configs/constants';
import DirectChat from '@utils/DirectChats/DirectChat';
import {DisplayAvatarParams} from '@utils/Messaging/interfaces';
import DirectReceiveAction from '../DirectReceiveAction';

class ReceiveAvatar extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    // await this.saveMessage();
    const chat = new DirectChat(this.chatId);

    //Avatars are saved as is since they are not relative URIs
    await chat.updateDisplayPic(
      (this.decryptedMessageContent.data as DisplayAvatarParams).fileUri ||
        DEFAULT_AVATAR,
    );
  }
}

export default ReceiveAvatar;
