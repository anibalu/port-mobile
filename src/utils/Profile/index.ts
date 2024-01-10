import {DEFAULT_NAME, NAME_LENGTH_LIMIT} from '../../configs/constants';
import store from '../../store/appStore';
import * as storage from '../Storage/profile';
import {ProfileInfo, ProfileInfoUpdate, ProfileStatus} from './interfaces';
import {connectionFsSync} from '../Synchronization';
import {FileAttributes} from '@utils/Storage/interfaces';
import {generateKeys} from '@utils/Crypto/ed25519';
import * as API from './APICalls';
import {DEFAULT_PROFILE_AVATAR_INFO} from '@configs/constants';
import {pickRandomAvatarId} from '@utils/IdGenerator';

function getDefaultAvatarInfo(): FileAttributes {
  return {...DEFAULT_PROFILE_AVATAR_INFO};
}
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
): Promise<ProfileStatus> {
  try {
    const existingProfile = await getProfileInfo();
    if (existingProfile) {
      await updateProfileName(name);
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
      profilePicInfo: getRandomAvatarInfo(),
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
    //const cachedProfile = {};
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

/**
 * Returns path to profile picture file if exists. null otherwise.
 * @returns {Promise<string | null>} - path to profile picture file (with file:// prefix) or null.
 */
export async function getProfilePictureUri(): Promise<string> {
  return (await getProfilePicture()).fileUri;
}

/**
 * Sets new profile picture with new file attributes
 * @param {FileAttributes} file - new profile picture file attributes
 */
export async function setNewProfilePicture(file: FileAttributes) {
  try {
    if (file.fileType === 'avatar') {
      await updateProfileInfo({profilePicInfo: file});
    } else {
      const newFile = await storage.moveProfilePictureToProfileDir(file);
      await updateProfileInfo({profilePicInfo: newFile});
    }
  } catch (error) {
    console.log('error saving profile pic: ', error);
  }
}

/**
 * deletes existing profile picture.
 */
export async function removeProfilePicture() {
  try {
    const profile: ProfileInfo | undefined = await getProfileInfo();
    if (!profile) {
      throw new Error('NoProfile');
    }
    const file = profile.profilePicInfo;
    await updateProfileInfo({profilePicInfo: getDefaultAvatarInfo()});
    if (file.fileType !== 'avatar') {
      await storage.removeProfilePicture(file);
    }
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
