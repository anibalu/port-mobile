//wiki added
import RNFS, {DocumentDirectoryPath} from 'react-native-fs';
import {profilePath} from '../configs/paths';
import {nicknameTruncate} from './Nickname';
import axios from 'axios';
import * as API from '../configs/api';
import {parsePEMPublicKey, publicKeyPEMencode} from '../utils/pem';
import {connectionFsSync} from './syncronization';
import {launchImageLibrary} from 'react-native-image-picker';

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
  const pathToFile = `${RNFS.DocumentDirectoryPath}/${profilePath}`;
  const isFile = await RNFS.exists(pathToFile);
  if (isFile) {
    const profileDataJSON = await RNFS.readFile(pathToFile, 'utf8');
    const profileData: profile = JSON.parse(profileDataJSON);
    const newProfileData = {...profileData, ...dataNew};
    await RNFS.writeFile(pathToFile, JSON.stringify(newProfileData), 'utf8');
  } else {
    await RNFS.writeFile(pathToFile, JSON.stringify(dataNew), 'utf8');
  }
}

export async function readProfileAsync(): Promise<profile> {
  try {
    const pathToFile = `${RNFS.DocumentDirectoryPath}/${profilePath}`;
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
  const selectedAssets = await launchImageLibrary({
    mediaType: 'photo',
    maxHeight: 1080,
    maxWidth: 1920,
    includeBase64: true,
  });
  let selectedImage;
  if (selectedAssets.assets) {
    selectedImage = selectedAssets.assets[0];
  } else {
    return false;
  }
  if (selectedImage.base64) {
    await RNFS.writeFile(
      DocumentDirectoryPath + 'profilePicture',
      selectedImage.base64,
      'base64',
    );
  }
  // console.log(await getProfilePictureURI())

  return selectedImage.uri;
}

export async function getProfilePictureURI() {
  const imageURI =
    'data:image/png;base64,' +
    (await RNFS.readFile(DocumentDirectoryPath + 'profilePicture', 'base64'));
  return imageURI;
}
