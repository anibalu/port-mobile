import {getChatPermissions} from '@utils/ChatPermissions';
import {ContentType} from '@utils/Messaging/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {getProfileName, getProfilePicture} from '@utils/Profile';
import {ChatType} from '@utils/Storage/DBCalls/connections';

import DirectReceiveAction from '../DirectReceiveAction';

class InitialInfoResponse extends DirectReceiveAction {
  generatePreviewText(): string {
    return '';
  }
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //send name
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
      //send display picture
      const sendDisplayPicture = new SendMessage(this.chatId, contentType, {
        ...profilePictureAttributes,
      });
      sendDisplayPicture.send();
    }
  }
}

export default InitialInfoResponse;
