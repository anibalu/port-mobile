import {DEFAULT_PROFILE_AVATAR_INFO} from '@configs/constants';
import {getConnections} from '@utils/Connections';
import {ChatType, ConnectionInfo} from '@utils/Connections/interfaces';
import {generateKeys} from '@utils/Crypto/ed25519';
import {pickRandomAvatarId} from '@utils/IdGenerator';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType, LargeDataParams} from '@utils/Messaging/interfaces';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {FileAttributes} from '@utils/Storage/interfaces';
import {DEFAULT_NAME, NAME_LENGTH_LIMIT} from '../../configs/constants';
import store from '../../store/appStore';
import * as storage from '../Storage/profile';
import {connectionFsSync} from '../Synchronization';
import * as API from './APICalls';
import {ProfileInfo, ProfileInfoUpdate, ProfileStatus} from './interfaces';
import {getChatPermissions} from '@utils/ChatPermissions';
import LargeDataUpload from '@utils/Messaging/LargeData/LargeDataUpload';

/**
 * Fetches default avatar file attributes
 * @returns default avatar file attributes
 */
function getDefaultAvatarInfo(): FileAttributes {
  return {...DEFAULT_PROFILE_AVATAR_INFO};
}

/**
 * Fetches a random avatar file attributes
 * @returns random avatar file attributes
 */
export function getRandomAvatarInfo(): FileAttributes {
  const randomAvatarId = pickRandomAvatarId();
  const randomInfo: FileAttributes = {
    fileUri: 'avatar://' + randomAvatarId,
    fileName: randomAvatarId,
    fileType: 'avatar',
  };
  return randomInfo;
}

/**
 * Sets up a user's profile info
 * @returns {Promise<ProfileStatus>} - If Profile got setup successfully or not.
 */
export async function setupProfile(
  name: string = DEFAULT_NAME,
  profilePic: FileAttributes = DEFAULT_PROFILE_AVATAR_INFO,
): Promise<ProfileStatus> {
  try {
    const existingProfile = await getProfileInfo();
    if (existingProfile) {
      return ProfileStatus.created;
    }

    //generate user keys
    const keys = await generateKeys();
    const privateKey = keys.privateKey;
    const publicKey = keys.publicKey;
    //get client Id and server key
    const {clientId} = await API.submitUserPublicKey(publicKey);
    //save to cache and storage
    const profile: ProfileInfo = {
      name: name,
      clientId: clientId,
      privateKey: privateKey,
      profilePicInfo:
        profilePic.fileType === 'avatar'
          ? profilePic
          : await storage.moveProfilePictureToProfileDir(profilePic),
    };
    store.dispatch({
      type: 'UPDATE_PROFILE',
      payload: profile,
    });
    await storage.saveProfileInfo(profile, true);
    return ProfileStatus.created;
  } catch (error) {
    console.log('error creating profile:', error);
    return ProfileStatus.failed;
  }
}

/**
 * Deletes a user's profile info. Used to clear failed onboarding.
 * @returns {Promise<void>} .
 */
export async function deleteProfile(): Promise<void> {
  try {
    store.dispatch({
      type: 'UPDATE_PROFILE',
      payload: undefined,
    });
    await storage.saveProfileInfo(undefined, true);
  } catch (error) {
    console.log('error deleting profile:', error);
  }
}

/**
 * gets the profile info of the user
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = true.
 * @returns {Promise<ProfileInfo|undefined>} - profile info of the user, undefined if none exist
 */
export async function getProfileInfo(
  blocking: boolean = true,
): Promise<ProfileInfo | undefined> {
  try {
    //read profile from cache
    const entireState = store.getState();
    const cachedProfile = entireState.profile.profile;
    //if profile doesn't exist in cache
    if (!cachedProfile.clientId) {
      //read profile from storage
      const savedProfile: ProfileInfo | undefined =
        await storage.getProfileInfo(blocking);
      //If undefined, no profile exists.
      if (savedProfile) {
        //update cache with profile info
        store.dispatch({
          type: 'UPDATE_PROFILE',
          payload: savedProfile,
        });
        return savedProfile;
      } else {
        return undefined;
      }
    }
    //if profile exists in cache
    else {
      const savedProfile: ProfileInfo = cachedProfile;
      return savedProfile;
    }
  } catch (error) {
    console.log('error getting profile: ', error);
    return undefined;
  }
}

/**
 * Checks if profile info exists
 * @returns {Promise<ProfileStatus>} - if profile info exists or not
 */
export async function checkProfileCreated(): Promise<ProfileStatus> {
  const response = await getProfileInfo(true);
  if (response) {
    return ProfileStatus.created;
  } else {
    console.log('profile doesnt exist');
    return ProfileStatus.failed;
  }
}

/**
 * Updates profile with new profile info
 * @param {ProfileInfoUpdate} profileUpdate - profile info being updated.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function updateProfileInfo(
  profileUpdate: ProfileInfoUpdate,
  blocking: boolean = true,
) {
  const synced = async () => {
    //get current profile info
    const currentProfile = await getProfileInfo(false);
    if (!currentProfile) {
      throw new Error('NoProfile');
    }
    currentProfile.name = profileUpdate.name
      ? processName(profileUpdate.name)
      : currentProfile.name;
    currentProfile.privateKey = profileUpdate.privateKey
      ? profileUpdate.privateKey
      : currentProfile.privateKey;
    currentProfile.clientId = profileUpdate.clientId
      ? profileUpdate.clientId
      : currentProfile.clientId;
    currentProfile.profilePicInfo = profileUpdate.profilePicInfo
      ? profileUpdate.profilePicInfo
      : currentProfile.profilePicInfo;
    currentProfile.lastBackupTime = profileUpdate.lastBackupTime
      ? profileUpdate.lastBackupTime
      : currentProfile.lastBackupTime;
    const profile: ProfileInfo = currentProfile;
    //update cache and storage
    await storage.saveProfileInfo(profile, false);
    store.dispatch({
      type: 'UPDATE_PROFILE',
      payload: profile,
    });
  };
  if (blocking) {
    await connectionFsSync(synced);
  } else {
    await synced();
  }
}

export async function updateProfileName(
  name: string,
  blocking: boolean = true,
) {
  await updateProfileInfo({name: name}, blocking);
}

export async function updateBackupTime(
  timestamp: string,
  blocking: boolean = true,
) {
  await updateProfileInfo({lastBackupTime: timestamp}, blocking);
}

export async function updateProfileAvatar(
  avatar: FileAttributes,
  blocking: boolean = true,
) {
  await updateProfileInfo({profilePicInfo: avatar}, blocking);
}

/**
 * Returns name in profile
 * @returns {string} - name in profile
 */
export async function getProfileName(): Promise<string> {
  const profile: ProfileInfo | undefined = await getProfileInfo();
  return profile ? profile.name : DEFAULT_NAME;
}

export async function getProfilePicture(): Promise<FileAttributes> {
  const profile: ProfileInfo | undefined = await getProfileInfo();
  return profile ? profile.profilePicInfo : getDefaultAvatarInfo();
}

export async function getLastBackupTime(): Promise<string | undefined> {
  const profile: ProfileInfo | undefined = await getProfileInfo();
  return profile ? profile.lastBackupTime : undefined;
}

/**
 * Returns path to profile picture file if exists. null otherwise.
 * @returns {Promise<string | null>} - path to profile picture file (with file:// prefix) or null.
 */
export async function getProfilePictureUri(): Promise<string> {
  const file = await getProfilePicture();
  if (file.fileType === 'avatar') {
    return file.fileUri;
  } else {
    return getSafeAbsoluteURI(file.fileUri, 'doc');
  }
}

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
    const connections: ConnectionInfo[] = await getConnections();
    if (file.fileType === 'avatar') {
      for (const conn of connections) {
        const isAllowed = (
          await getChatPermissions(
            conn.chatId,
            conn.connectionType === ChatType.group
              ? ChatType.group
              : ChatType.direct,
          )
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
      const newFile = (await storage.moveProfilePictureToProfileDir(
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
          if (isAllowed) {
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
export async function removeProfilePicture() {
  try {
    const profile: ProfileInfo | undefined = await getProfileInfo();
    if (!profile) {
      throw new Error('NoProfile');
    }
    const file = profile.profilePicInfo;
    if (file.fileType !== 'avatar') {
      await storage.removeProfilePicture(file);
    }
    await updateProfileInfo({profilePicInfo: getDefaultAvatarInfo()});
  } catch (error) {
    console.log('error removing profile pic: ', error);
  }
}

/**
 * runs sanity checks on the name
 * @param {string} rawName - proposed new name
 * @returns {string} - name trimmed and processed to meet specifications
 */
export function processName(rawName: string): string {
  const trimmedRawName = rawName.trim().substring(0, NAME_LENGTH_LIMIT);
  if (trimmedRawName === '') {
    return DEFAULT_NAME;
  }
  return trimmedRawName;
}
