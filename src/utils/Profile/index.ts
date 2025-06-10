import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_NAME, DEFAULT_PROFILE_AVATAR_INFO, NAME_LENGTH_LIMIT } from '@configs/constants';

import { generateKeys } from '@utils/Crypto/ed25519';
import { pickRandomAvatarId } from '@utils/IdGenerator';
import {
  ProfileInfo,
  ProfileInfoUpdate,
  ProfileStatus,
} from '@utils/Storage/RNSecure/secureProfileHandler';
import { FileAttributes } from '@utils/Storage/StorageRNFS/interfaces';
import { getSafeAbsoluteURI } from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import { generateISOTimeStamp } from '@utils/Time';

import store from '../../store/appStore';
import * as storage from '../Storage/profile';

import * as API from './APICalls';


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
    const { clientId } = await API.submitUserPublicKey(publicKey);
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
    if (
      profileStore?.name ||
      profileStore?.profilePicInfo ||
      profileStore?.lastBackupTime
    ) {
      shouldUpdateProfileStore = false;
    }
    //read profile from cache
    if (cachedProfile) {
      if (shouldUpdateProfileStore) {
        updateProfileStore();
      }
      return { ...cachedProfile };
    }
    //read profile from storage
    const savedProfile: ProfileInfo | undefined =
      await storage.getProfileInfo();
    //If undefined, no profile exists.
    if (savedProfile && savedProfile.clientId) {
      //update cache with profile info
      cachedProfile = savedProfile;
      if (shouldUpdateProfileStore) {
        updateProfileStore();
      }
      return { ...cachedProfile };
    }
  } catch (error) {
    console.log('error getting profile: ', error);
    return undefined;
  }
  return undefined;
}

/**
 * Saves the fact that profile exists to async storage.
 */
async function markThatProfileExists() {
  try {
    await AsyncStorage.setItem('ProfileExists', 'true');
  } catch (error) {
    console.log('markThatProfileExists error', error);
  }
}

/**
 * Gets the fact that profile exists from async storage.
 */
async function getWhetherProfileExists() {
  try {
    const itemString = await AsyncStorage.getItem('ProfileExists');
    if (itemString) {
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

/**
 * Checks if profile info exists. 
 * If it does, it marks that profile exists in async storage.
 * @returns {Promise<ProfileStatus>} - if profile info exists or not
 */
export async function checkProfileCreated(): Promise<ProfileStatus> {
  const profileExists = await getWhetherProfileExists();
  if (profileExists) {
    return ProfileStatus.created;
  } else {
    const response = await getProfileInfo();
    if (response) {
      if (response.clientId) {
        await markThatProfileExists();
        return ProfileStatus.created;
      } else {
        return ProfileStatus.unknown;
      }
    } else {
      return ProfileStatus.failed;
    }
  }
}

/**
 * Updates profile with new profile info
 * @param {ProfileInfoUpdate} profileUpdate - profile info being updated.
 */
export async function updateProfileInfo(profileUpdate: ProfileInfoUpdate) {
  //get current profile info
  const currentProfile = await getProfileInfo();
  if (!currentProfile) {
    throw new Error('NoProfile');
  }
  if (profileUpdate.name) {
    profileUpdate.name = processName(profileUpdate.name);
  }
  const updatedProfile = { ...currentProfile, ...profileUpdate };
  console.log('updatedProfile', updatedProfile);
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
  await updateProfileInfo({ name: name });
}

/**
 * Sets profile backup time once backup is successfully created.
 */
export async function setBackupTime() {
  await updateProfileInfo({ lastBackupTime: generateISOTimeStamp() });
}



/**
 * Updates profile avatar
 * @param {FileAttributes} avatar - new avatar
 */
export async function updateProfileAvatar(avatar: FileAttributes) {
  await updateProfileInfo({ profilePicInfo: avatar });
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
  return { ...DEFAULT_PROFILE_AVATAR_INFO };
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
