import EncryptedStorage from 'react-native-encrypted-storage';
import {tokenKey} from '../../../configs/paths';
import {SavedServerAuthToken} from '../../ServerAuth/interfaces';
import {connectionFsSync} from '../../Synchronization';

/**
 * reads token info from encrypted storage
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @throws {Error} If there is no token info.
 * @returns {SavedServerAuthToken|undefined} token - token info saved in file
 */
export async function getTokenInfoRNSS(
  blocking: boolean = false,
): Promise<SavedServerAuthToken | undefined> {
  if (blocking) {
    const synced = async () => {
      return await readTokenInfoAsync();
    };
    return await connectionFsSync(synced);
  } else {
    return await readTokenInfoAsync();
  }
}

/**
 * saves token info to encrypted file
 * @param {SavedServerAuthToken} token - token info to save
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveTokenInfoRNSS(
  token: SavedServerAuthToken,
  blocking: boolean = false,
): Promise<void> {
  if (blocking) {
    const synced = async () => {
      await saveTokenInfoAsync(token);
    };
    await connectionFsSync(synced);
  } else {
    await saveTokenInfoAsync(token);
  }
}

/**
 * Overwrites token file with new info
 * @param {SavedServerAuthToken} savedToken - the token information to overwrite with
 */
async function saveTokenInfoAsync(
  savedToken: SavedServerAuthToken,
): Promise<void> {
  await EncryptedStorage.setItem(tokenKey, JSON.stringify(savedToken));
}

/**
 * Reads token info from token file
 * @returns {SavedServerAuthToken|undefined} - token info read from encrypted storage. Returns undefined if the storage doesn't exist
 */
async function readTokenInfoAsync(): Promise<SavedServerAuthToken | undefined> {
  try {
    const session: any = await EncryptedStorage.getItem(tokenKey);
    return JSON.parse(session);
  } catch (error) {
    console.log('Error reading token from encrypted storage: ', error);
    return undefined;
  }
}
