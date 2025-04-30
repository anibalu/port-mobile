import EncryptedStorage from 'react-native-encrypted-storage';

import {SLKey} from '../../../configs/paths';

export interface ShortLivedKey {
  timestamp: string; // expiry timestamp
  privateKey: string;
}

export interface ShortLivedKeyExpiryWithTokenExpiry {
  token: string;
  token_timestamp: string; // JWT expiry timestamp
  slk_timestamp: string; // SLK expiry timestamp
}

/**
 * saves ShortLivedKey info to encrypted file
 * @param {shortLivedKey} shortLivedKey - ShortLivedKey info to save
 */
export async function saveShortLivedKeyRNSS(
  shortLivedKey: ShortLivedKey,
): Promise<void> {
  await EncryptedStorage.setItem(SLKey, JSON.stringify(shortLivedKey));
}

/**
 * Reads ShortLivedKey info from ShortLivedKey file
 * @returns {ShortLivedKey|undefined} - ShortLivedKey info read from encrypted storage. Returns undefined if the storage doesn't exist
 */
export async function readShortLivedKeyRNSS(): Promise<
  ShortLivedKey | undefined
> {
  try {
    const SL_Key: any = await EncryptedStorage.getItem(SLKey);
    return JSON.parse(SL_Key);
  } catch (error) {
    console.log('Error reading ShortLivedKey from encrypted storage: ', error);
    return undefined;
  }
}
