//wiki added
import {TOKEN_VALIDITY_INTERVAL} from '../configs/constants';
import {tokenPath} from '../configs/paths';
import RNFS from 'react-native-fs';
import {symmetricEncrypt} from '@numberless/react-native-numberless-crypto';
import axios from 'axios';
import {AUTH_SERVER_CHALLENGE_RESOURCE} from '../configs/api';
import {cipher} from '../utils/Crypto';
import {profile, readProfileAsync} from '../utils/Profile';
import {connectionFsSync} from './syncronization';

export interface challenge {
  challenge: string;
}

export interface token {
  ad: string;
  nonce: string;
  secret: string;
}
export interface savedToken {
  timestamp: string;
  token: token;
}
//checks if the token has timedout
export function checkTimeout(
  timestamp: string,
  acceptedDuration: number = TOKEN_VALIDITY_INTERVAL,
): boolean {
  const timeStamp: Date = new Date(timestamp);
  const now: Date = new Date();
  const timeDiff = now.getTime() - timeStamp.getTime();
  if (timeDiff <= acceptedDuration) {
    return true;
  } else {
    return false;
  }
}

async function checkSavedTokenAsync(): Promise<boolean> {
  const pathToFile = `${RNFS.DocumentDirectoryPath}/${tokenPath}`;
  const isFile = await RNFS.exists(pathToFile);
  return isFile;
}

async function readTokenAsync(): Promise<savedToken> {
  const pathToFile = `${RNFS.DocumentDirectoryPath}/${tokenPath}`;
  const isToken = await checkSavedTokenAsync();
  if (isToken) {
    const savedTokenJSON: string = await RNFS.readFile(pathToFile, 'utf8');
    const savedToken: savedToken = JSON.parse(savedTokenJSON);
    return savedToken;
  }
  throw new Error('TokenNotFoundError');
}

export async function saveTokenAsync(token: token): Promise<void> {
  const pathToFile = `${RNFS.DocumentDirectoryPath}/${tokenPath}`;
  const now: Date = new Date();
  const newSavedToken: savedToken = {
    timestamp: now.toISOString(),
    token: token,
  };
  await RNFS.writeFile(pathToFile, JSON.stringify(newSavedToken), 'utf8');
}

async function getNewChallenge(userId: string) {
  const response = await axios.get(`${AUTH_SERVER_CHALLENGE_RESOURCE}/${userId}`);
  return response.data;
}

async function postEncryptedChallenge(userId: string, cipher: cipher) {
  const response = await axios.post(
    `${AUTH_SERVER_CHALLENGE_RESOURCE}/${userId}`,
    cipher,
  );
  return response.data;
}

async function generateNewTokenAsync(): Promise<token> {
  const profile: profile = await readProfileAsync();
  if (profile.userId && profile.sharedSecret) {
    const challenge = await getNewChallenge(profile.userId);
    const encChallenge: string = await symmetricEncrypt(
      profile.sharedSecret,
      challenge.challenge,
      profile.userId,
    );
    const cipher: cipher = JSON.parse(encChallenge);
    const response = await postEncryptedChallenge(profile.userId, cipher);
    const token: token = response;
    return token;
  }
  throw new Error('UserOrSecretUngeneratedError');
}

export async function getToken(): Promise<token | null> {
  const synced = async () => {
    try {
      const isSavedToken = await checkSavedTokenAsync();
      if (isSavedToken) {
        const savedToken = await readTokenAsync();
        const isValid = checkTimeout(savedToken.timestamp);
        if (isValid) {
          return savedToken.token;
        } else {
          const token = await generateNewTokenAsync();
          await saveTokenAsync(token);
          return token;
        }
      } else {
        const token = await generateNewTokenAsync();
        await saveTokenAsync(token);
        return token;
      }
    } catch (error) {
      console.log('Error getting token: ', error);
      return null;
    }
  };
  return await connectionFsSync(synced);
}

export async function getTokenAsync(): Promise<token | null> {
  try {
    const isSavedToken = await checkSavedTokenAsync();
    if (isSavedToken) {
      const savedToken = await readTokenAsync();
      const isValid = checkTimeout(savedToken.timestamp);
      if (isValid) {
        return savedToken.token;
      } else {
        const token = await generateNewTokenAsync();
        await saveTokenAsync(token);
        return token;
      }
    } else {
      const token = await generateNewTokenAsync();
      await saveTokenAsync(token);
      return token;
    }
  } catch (error) {
    console.log('Error getting token: ', error);
    return null;
  }
}
