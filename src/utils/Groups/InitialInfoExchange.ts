import {getChatPermissions} from '@utils/ChatPermissions';
import {ContentType} from '@utils/Messaging/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {getProfileName, getProfilePicture} from '@utils/Profile';
import {ChatType} from '@utils/Storage/DBCalls/connections';

/**
 * Initial messages sent by port reader.
 * @param chatId
 */
export async function readerInitialInfoSend(chatId: string) {
  //send name
  const nameSender = new SendMessage(chatId, ContentType.name, {
    name: await getProfileName(),
  });
  await nameSender.send();
  //send profile picture based on permission
  const chatPermissions = await getChatPermissions(chatId, ChatType.group);
  if (chatPermissions.displayPicture) {
    const profilePictureAttributes = await getProfilePicture();
    if (!profilePictureAttributes) {
      return;
    }
    const contentType =
      profilePictureAttributes.fileType === 'avatar'
        ? ContentType.displayAvatar
        : ContentType.displayImage;
    const sendDisplayPicture = new SendMessage(chatId, contentType, {
      ...profilePictureAttributes,
    });
    await sendDisplayPicture.send();
  }
}
