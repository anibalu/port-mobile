import {ContentType} from '@utils/Messaging/interfaces';
import DirectReceiveAction from '../DirectReceiveAction';
import {getProfileName, getProfilePicture} from '@utils/Profile';
import {getChatPermissions} from '@utils/ChatPermissions';
import {ChatType} from '@utils/Connections/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';

class InitialInfoResponse extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const sender = new SendMessage(this.chatId, ContentType.name, {
      name: await getProfileName(),
    });
    sender.send();

    const chatPermissions = await getChatPermissions(
      this.chatId,
      ChatType.direct,
    );
    if (!chatPermissions.displayPicture) {
      return;
    }
    //send profile picture if that permission is given
    if (chatPermissions.displayPicture) {
      const profilePictureAttributes = await getProfilePicture();
      if (!profilePictureAttributes) {
        return;
      }
      const contentType =
        profilePictureAttributes.fileType === 'avatar'
          ? ContentType.displayAvatar
          : ContentType.displayImage;
      const sendDisplayPicture = new SendMessage(this.chatId, contentType, {
        ...profilePictureAttributes,
      });
      await sendDisplayPicture.send();
    }
  }
}

export default InitialInfoResponse;
