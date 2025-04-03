import EncryptedStorage from 'react-native-encrypted-storage';
import {tokenKey} from '../../../configs/paths';

export type ServerAuthToken = string;

export interface SavedServerAuthToken {
  timestamp: string;
  token: ServerAuthToken;
}

/**
 * reads token info from encrypted storage
 * @throws {Error} If there is no token info.
 * @returns {SavedServerAuthToken|undefined} token - token info saved in file
 */
export async function getTokenInfoRNSS(): Promise<
  SavedServerAuthToken | undefined
> {
  try {
    const session: any = await EncryptedStorage.getItem(tokenKey);
    return JSON.parse(session);
  } catch (error) {
    console.log('Error reading token from encrypted storage: ', error);
    return undefined;
  }
}

/**
 * saves token info to encrypted file
 * @param {SavedServerAuthToken} token - token info to save
 */
export async function saveTokenInfoRNSS(
  token: SavedServerAuthToken,
): Promise<void> {
  try {
    await EncryptedStorage.setItem(tokenKey, JSON.stringify(token));
  } catch (error) {
    console.log('Error saving token to encrypted storage: ', error);
  }
}
