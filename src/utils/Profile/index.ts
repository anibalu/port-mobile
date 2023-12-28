import axios from 'axios';
import {
  DEFAULT_AVATAR,
  DEFAULT_NAME,
  NAME_LENGTH_LIMIT,
} from '../../configs/constants';
import store from '../../store/appStore';
import {
  generateKeyPair,
  generateSharedKey,
  publicKeyPEMdecode,
  publicKeyPEMencode,
} from '../Crypto/x25519';
import * as storage from '../Storage/profile';
import {
  ProfileInfo,
  ProfileInfoUpdate,
  ProfileServerGenerated,
  ProfileStatus,
} from './interfaces';
import {INITIAL_POST_MANAGEMENT_RESOURCE} from '../../configs/api';
import {connectionFsSync} from '../Synchronization';
import {FileAttributes} from '../Storage/sharedFile';

/**
 * Sets up a user's profile info
 * @returns {Promise<ProfileStatus>} - If Profile got setup successfully or not.
 */
export async function setupNewProfile(
  name: string = DEFAULT_NAME,
): Promise<ProfileStatus> {
  try {
    //generate user keys
    const {privKey, pubKey} = await generateKeyPair();
    //get client Id and server key
    const {clientId, serverKey} = await postUserPubKey(pubKey);
    //generate shared secret
    const {sharedSecret} = await generateSharedKey(privKey, serverKey);
    //save to cache and storage
    const profile: ProfileInfo = {
      name,
      clientId,
      serverKey,
      privKey,
      pubKey,
      sharedSecret,
    };
    store.dispatch({
      type: 'UPDATE_PROFILE',
      payload: profile,
    });
    await storage.saveProfileInfo(profile, true);
    return ProfileStatus.created;
  } catch (error) {
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
  //read profile from cache
  const entireState = store.getState();
  const cachedProfile = entireState.profile.profile;
  //const cachedProfile = {};
  //if profile doesn't exist in cache
  if (cachedProfile.clientId === undefined) {
    //read profile from storage
    const savedProfile: ProfileInfo | undefined = await storage.getProfileInfo(
      blocking,
    );
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
}

/**
 * Checks if profile info exists
 * @returns {Promise<ProfileStatus>} - if profile info exists or not
 */
export async function checkProfile(): Promise<ProfileStatus> {
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
    let name: string = currentProfile!.name;
    if (profileUpdate.name) {
      name = processName(profileUpdate.name);
    }
    const profile: ProfileInfo = {...currentProfile, ...profileUpdate, name};
    //update cache and storage
    store.dispatch({
      type: 'UPDATE_PROFILE',
      payload: profile,
    });
    await storage.saveProfileInfo(profile, false);
  };
  if (blocking) {
    await connectionFsSync(synced);
  } else {
    await synced();
  }
}

/**
 * Returns name in profile
 * @returns {string} - name in profile
 */
export async function getProfileName(): Promise<string> {
  const profile: ProfileInfo | undefined = await getProfileInfo();
  return profile?.name ? profile.name : DEFAULT_NAME;
}

/**
 * Returns path to profile picture file if exists. null otherwise.
 * @returns {Promise<string | null>} - path to profile picture file (with file:// prefix) or null.
 */
export async function getProfilePicture(): Promise<string | null> {
  try {
    const file: FileAttributes = await storage.getProfilePicAttributes(true);
    return file.fileUri;
  } catch (error) {
    return DEFAULT_AVATAR;
  }
}

export async function getProfilePictureAttributes(): Promise<FileAttributes | null> {
  try {
    const file: FileAttributes = await storage.getProfilePicAttributes(true);
    return file;
  } catch (error) {
    return null;
  }
}

/**
 * Sets new profile picture with new file attributes
 * @param {FileAttributes} file - new profile picture file attributes
 */
export async function setNewProfilePicture(file: FileAttributes) {
  try {
    console.log('saving new dp: ', file);
    await storage.saveProfilePicAttributes(file, true);
  } catch (error) {
    console.log('error saving profile pic');
  }
}

/**
 * deletes existing profile picture.
 */
export async function removeProfilePicture() {
  await storage.deleteProfilePicture(true);
}

/**
 * Posts user pubKey and receives serverKey and clientId in response.
 * @param {string} pubKey - url-safe base64 encoded public key of the user
 * @throws {Error} - If there is an issue posting user key or in the response
 * @returns {ProfileServerGenerated} - serverKey and clientId generated by the server.
 */
async function postUserPubKey(pubKey: string): Promise<ProfileServerGenerated> {
  const response = await axios.post(INITIAL_POST_MANAGEMENT_RESOURCE, {
    authPubKey: publicKeyPEMencode(pubKey),
  });
  if (
    response.data.userId !== undefined &&
    response.data.peerPubKey !== undefined
  ) {
    const serverGenerated: ProfileServerGenerated = {
      clientId: response.data.userId,
      serverKey: publicKeyPEMdecode(response.data.peerPubKey),
    };
    return serverGenerated;
  }
  throw new Error('ErrorInServerProfileResponse');
}

/**
 * runs sanity checks on the name
 * @param {string} rawName - proposed new name
 * @returns {string} - name trimmed and processed to meet specifications
 */
export function processName(rawName: string) {
  const trimmedRawName = rawName.trim().substring(0, NAME_LENGTH_LIMIT);
  if (trimmedRawName === '') {
    return DEFAULT_NAME;
  }
  return trimmedRawName;
}
