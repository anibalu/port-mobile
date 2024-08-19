import {getChatPermissions} from '@utils/ChatPermissions';
import {ContentType, LargeDataParams} from '@utils/Messaging/interfaces';
import LargeDataUpload from '@utils/Messaging/LargeData/LargeDataUpload';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {
  getDefaultAvatarInfo,
  getProfileInfo,
  updateProfileInfo,
} from '@utils/Profile';
import {getConnections} from '@utils/Storage/connections';
import {ChatType} from '@utils/Storage/DBCalls/connections';
import * as profileStorage from '@utils/Storage/profile';
import {ProfileInfo} from '@utils/Storage/RNSecure/secureProfileHandler';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';

/**
 * Sets new profile picture with new file attributes and sends it to contacts with profile picture permissions.
 * This function skips media upload step if user has not connections (as would be the case at onboarding).
 * @param {FileAttributes} file - new profile picture file attributes
 */
export async function setNewProfilePicture(
  file: FileAttributes = getDefaultAvatarInfo(),
) {
  try {
    await removeProfilePicture();
    const connections = await getConnections();
    if (file.fileType === 'avatar') {
      for (const conn of connections) {
        const isAllowed = (
          await getChatPermissions(conn.chatId, conn.connectionType)
        ).displayPicture;
        if (isAllowed) {
          const sendDisplayPicture = new SendMessage(
            conn.chatId,
            ContentType.displayAvatar,
            {
              ...file,
              fileType: 'avatar',
            },
          );
          sendDisplayPicture.send();
        }
      }
      await updateProfileInfo({profilePicInfo: file});
    } else {
      const newFile = (await profileStorage.moveProfilePictureToProfileDir(
        file,
      )) as LargeDataParams;
      await updateProfileInfo({profilePicInfo: newFile as FileAttributes});
      //upload step is skipped if there are no connections
      if (connections.length > 0) {
        // Upload the profile picture to prevent re-uploads for each chat
        const uploader = new LargeDataUpload(
          newFile.fileUri || 'missing file path in profile upload',
          newFile.fileName,
          newFile.fileType,
        );
        await uploader.upload();
        const {mediaId, key} = uploader.getMediaIdAndKey();
        newFile.mediaId = mediaId;
        newFile.key = key;
        for (const conn of connections) {
          const isAllowed = (
            await getChatPermissions(
              conn.chatId,
              conn.connectionType === ChatType.group
                ? ChatType.group
                : ChatType.direct,
            )
          ).displayPicture;
          if (isAllowed && newFile.mediaId) {
            const sendDisplayPicture = new SendMessage(
              conn.chatId,
              ContentType.displayImage,
              {
                ...newFile,
                mediaId,
                key,
              },
            );
            sendDisplayPicture.send();
          }
        }
      }
    }
  } catch (error) {
    console.log('error updating profile pic: ', error);
  }
}

/**
 * deletes existing profile picture and updates with default picture
 */
async function removeProfilePicture() {
  try {
    const profile: ProfileInfo | undefined = await getProfileInfo();
    if (!profile) {
      throw new Error('NoProfile');
    }
    const file = profile.profilePicInfo;
    if (file.fileType !== 'avatar') {
      await profileStorage.removeProfilePicture(file);
    }
    await updateProfileInfo({profilePicInfo: getDefaultAvatarInfo()});
  } catch (error) {
    console.log('error removing profile pic: ', error);
  }
}
