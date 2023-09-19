//wiki added
import RNFS from 'react-native-fs';
import {profileDir, profileDataPath} from '../configs/paths';
import {nicknameTruncate} from './Nickname';
import axios from 'axios';
import * as API from '../configs/api';
import {parsePEMPublicKey, publicKeyPEMencode} from '../utils/pem';
import {connectionFsSync} from './syncronization';
import {Asset, launchImageLibrary} from 'react-native-image-picker';

export interface profile {
  //nickname chosen by user
  nickname?: string;
  //Id assigned by the server to user
  userId?: string;
  //server's public key
  serverKey?: string;
  //user's private key for commmunication with server
  privKey?: string;
  //user's public key for communication with server
  pubKey?: string;
  //shared secret generated using server's public key and user's private key
  sharedSecret?: string;
}

export interface serverResponse {
  serverKey: string;
  userId: string;
}
/**
 * Creates a profile directory if it doesn't exist and returns the path to it.
 * @returns {Promise<string>} The path to the profile directory.
 */
async function makeProfileDir(): Promise<string> {
  const profileDirPath = RNFS.DocumentDirectoryPath + `${profileDir}`;
  const folderExists = await RNFS.exists(profileDirPath);
  if (folderExists) {
    return profileDirPath;
  } else {
    await RNFS.mkdir(profileDirPath);
    return profileDirPath;
  }
}
/**
 * Retrieves the path to the profile data file inside the profile directory.
 * This function ensures the profile directory exists.
 * @returns {Promise<string>} The path to the profile data file.
 */
async function getProfileDataPath(): Promise<string> {
  const profileDirPath = await makeProfileDir();
  return profileDirPath + profileDataPath;
}
/**
 * Retrieves the path to the profile picture file inside the profile directory.
 * This function ensures the profile directory exists.
 * @returns {Promise<string>} The path to the profile picture file.
 */
async function getProfilePicPath() {
  const profileDirPath = await makeProfileDir();
  const files = await RNFS.readDir(profileDirPath);
  const filteredFiles = files.filter(file => file.name !== 'data.json');
  if (filteredFiles.length >= 1) {
    return filteredFiles[0].path;
  }
  return null;
}
export async function getProfilePicName() {
  const profileDirPath = await makeProfileDir();
  const files = await RNFS.readDir(profileDirPath);
  const filteredFiles = files.filter(file => file.name !== 'data.json');
  if (filteredFiles.length >= 1) {
    return filteredFiles[0].name;
  }
  return '';
}

//updates a user's profile.json file. creates file if none exists.
export async function updateProfile(data: profile): Promise<void> {
  const synced = async () => {
    await updateProfileAsync(data);
  };
  await connectionFsSync(synced);
}

export async function updateProfileAsync(data: profile): Promise<void> {
  const dataNew: profile = data;
  //check size of nickname. If size > JOIN_SCREEN_INPUT_LIMIT, truncate.
  if (data.nickname) {
    dataNew.nickname = nicknameTruncate(data.nickname);
  }
  const pathToFile = await getProfileDataPath();
  const isFile = await RNFS.exists(pathToFile);
  if (isFile) {
    const profileDataJSON = await RNFS.readFile(pathToFile, 'utf8');
    const profileData: profile = JSON.parse(profileDataJSON);
    const newProfileData = {...profileData, ...dataNew};
    await RNFS.writeFile(pathToFile, JSON.stringify(newProfileData), 'utf8');
  } else {
    await RNFS.writeFile(pathToFile, JSON.stringify(dataNew), 'utf8');
    console.log('profile file created: ', pathToFile);
  }
}

export async function readProfileAsync(): Promise<profile> {
  try {
    const pathToFile = await getProfileDataPath();
    const profileDataJSON = await RNFS.readFile(pathToFile, 'utf8');
    const profileData: profile = JSON.parse(profileDataJSON);
    return profileData;
  } catch (error) {
    console.log('Error reading profile data. File may not exist: ', error);
    return {};
  }
}

export async function readProfile(): Promise<profile> {
  const synced = async () => {
    return await readProfileAsync();
  };
  return await connectionFsSync(synced);
}

export async function readProfileNickname(): Promise<string> {
  const synced = async () => {
    const profileData: profile = await readProfileAsync();
    if (profileData.nickname) {
      return profileData.nickname;
    }
    throw new Error('NoProfileNicknameError');
  };
  return await connectionFsSync(synced);
}

export async function postUserPubKey(pubKey: string) {
  const response = await axios.post(API.INITIAL_POST_MANAGEMENT_RESOURCE, {
    authPubKey: publicKeyPEMencode(pubKey),
  });
  return response.data;
}

export async function getUserIdAndServerKey(
  pubKey: string,
): Promise<serverResponse | null> {
  const synced = async () => {
    const profileData: profile = await readProfileAsync();
    if (profileData.userId && profileData.serverKey) {
      const response: serverResponse = {
        serverKey: profileData.serverKey,
        userId: profileData.userId,
      };
      return response;
    }
    try {
      const response = await postUserPubKey(pubKey);
      const successfulResponse: serverResponse = {
        serverKey: parsePEMPublicKey(response.peerPubKey),
        userId: response.userId,
      };
      await updateProfileAsync(successfulResponse);
      return successfulResponse;
    } catch (error) {
      console.log('error in getting user Id: ', error);
      return null;
    }
  };
  return await connectionFsSync(synced);
}

export async function setNewProfilePicture() {
  try {
    const selectedAssets = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
    });
    //images are selected
    const selected: Asset[] = selectedAssets.assets || [];
    if (selected.length >= 1) {
      const selectedImage = selected[0];
      const pathToCurrentPic = await getProfilePicPath();
      if (pathToCurrentPic !== null) {
        await RNFS.unlink(pathToCurrentPic);
      }
      const pathToPic = (await makeProfileDir()) + '/' + selectedImage.fileName;
      await RNFS.copyFile(selectedImage.uri, pathToPic);
      return `file://${pathToPic}`;
    } else {
      return false;
    }
  } catch (error) {
    console.log('Nothing selected', error);
    return false;
  }
}

export async function checkProfilePicture() {
  const pathToPic = await getProfilePicPath();
  if (pathToPic !== null) {
    return `file://${pathToPic}`;
  }
  return false;
}
