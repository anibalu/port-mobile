import {
  ContentType,
  InitialInfoRequestParams,
} from '@utils/Messaging/interfaces';
import DirectReceiveAction from '../DirectReceiveAction';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {getProfileName, getProfilePicture} from '@utils/Profile';
import {getChatPermissions} from '@utils/ChatPermissions';
import {ChatType} from '@utils/Connections/interfaces';

class InitialInfoResponse extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const requestedData = this.decryptedMessageContent
      .data as InitialInfoRequestParams;
    if (requestedData.sendName) {
      const sender = new SendMessage(this.chatId, ContentType.name, {
        name: await getProfileName(),
      });
      sender.send();
    }

    if (requestedData.sendProfilePicture) {
      //send profile picture if that permission is given
      const chatPermissions = await getChatPermissions(
        this.chatId,
        ChatType.direct,
      );
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
}

export default InitialInfoResponse;
