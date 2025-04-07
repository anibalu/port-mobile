import {DEFAULT_PROFILE_AVATAR_INFO} from '@configs/constants';
import {generateKeys} from '@utils/Crypto/ed25519';
import {pickRandomAvatarId} from '@utils/IdGenerator';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';
import {DEFAULT_NAME, NAME_LENGTH_LIMIT} from '../../configs/constants';
import store from '../../store/appStore';
import * as storage from '../Storage/profile';
import * as API from './APICalls';
import {
  ProfileInfo,
  ProfileInfoUpdate,
  ProfileStatus,
} from '@utils/Storage/RNSecure/secureProfileHandler';

// global object to cache profile information so that it doesn't have to be repeatedly read from storage
let cachedProfile: ProfileInfo | undefined;

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
    cachedProfile = profile;
    await storage.saveProfileInfo(profile);
    updateProfileStore();
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
    cachedProfile = undefined;
    await storage.deleteProfileInfo();
    store.dispatch({
      type: 'DELETE_PROFILE',
      payload: undefined,
    });
  } catch (error) {
    console.log('error deleting profile:', error);
  }
}

/**
 * Updates the profile store with the cached profile info
 */
function updateProfileStore() {
  if (cachedProfile) {
    store.dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        name: cachedProfile.name,
        profilePicInfo: cachedProfile.profilePicInfo,
        lastBackupTime: cachedProfile.lastBackupTime,
      },
    });
  }
}

/**
 * gets the profile info of the user
 * @returns {Promise<ProfileInfo|undefined>} - profile info of the user, undefined if none exist
 */
export async function getProfileInfo(): Promise<ProfileInfo | undefined> {
  let shouldUpdateProfileStore = true;
  try {
    const profileStore = store?.getState()?.profile?.profile;
    //check if profile store has any values. If it does, we need not update the profile store.
    if (
      profileStore?.name ||
      profileStore?.profilePicInfo ||
      profileStore?.lastBackupTime
    ) {
      shouldUpdateProfileStore = false;
    }
    //read profile from cache
    if (cachedProfile) {
      console.log('returning cached profile: ', cachedProfile);
      if (shouldUpdateProfileStore) {
        updateProfileStore();
      }
      return {...cachedProfile};
    }
    //read profile from storage
    const savedProfile: ProfileInfo | undefined =
      await storage.getProfileInfo();
    console.log('returning saved profile: ', savedProfile);
    //If undefined, no profile exists.
    if (savedProfile && savedProfile.clientId) {
      //update cache with profile info
      cachedProfile = savedProfile;
      if (shouldUpdateProfileStore) {
        updateProfileStore();
      }
      return {...cachedProfile};
    }
  } catch (error) {
    console.log('error getting profile: ', error);
    return undefined;
  }
  return undefined;
}

/**
 * Checks if profile info exists
 * @returns {Promise<ProfileStatus>} - if profile info exists or not
 */
export async function checkProfileCreated(): Promise<ProfileStatus> {
  const response = await getProfileInfo();
  if (response) {
    if (response.clientId) {
      return ProfileStatus.created;
    } else {
      return ProfileStatus.unknown;
    }
  } else {
    return ProfileStatus.failed;
  }
}

/**
 * Updates profile with new profile info
 * @param {ProfileInfoUpdate} profileUpdate - profile info being updated.
 */
export async function updateProfileInfo(profileUpdate: ProfileInfoUpdate) {
  //get current profile info
  if (!cachedProfile) {
    throw new Error('NoProfile');
  }
  if (profileUpdate.name) {
    profileUpdate.name = processName(profileUpdate.name);
  }
  const updatedProfile = {...cachedProfile, ...profileUpdate};
  //update cache and storage
  await storage.saveProfileInfo(updatedProfile);
  cachedProfile = updatedProfile;
  updateProfileStore();
}

/**
 * Updates profile name
 * @param {string} name - new name
 */
export async function updateProfileName(name: string) {
  await updateProfileInfo({name: name});
}

/**
 * Updates profile backup time
 * @param {string} timestamp - new backup time
 */
export async function updateBackupTime(timestamp: string) {
  await updateProfileInfo({lastBackupTime: timestamp});
}

/**
 * Updates profile avatar
 * @param {FileAttributes} avatar - new avatar
 */
export async function updateProfileAvatar(avatar: FileAttributes) {
  await updateProfileInfo({profilePicInfo: avatar});
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
  return getSafeAbsoluteURI(file.fileUri);
}

/**
 * Fetches default avatar file attributes
 * @returns default avatar file attributes
 */
export function getDefaultAvatarInfo(): FileAttributes {
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
 * runs sanity checks on the name
 * @param {string} rawName - proposed new name
 * @returns {string} - name trimmed and processed to meet specifications
 */
export function processName(rawName: string): string {
  const trimmedRawName = rawName.trim().substring(0, NAME_LENGTH_LIMIT);
  return trimmedRawName;
}
