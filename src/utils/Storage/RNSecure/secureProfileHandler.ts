import {sessionKey} from '@configs/paths';
import {ProfileInfo} from '@utils/Profile/interfaces';
import {connectionFsSync} from '@utils/Synchronization';
import EncryptedStorage from 'react-native-encrypted-storage';

/**
 * reads profile info from file
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @throws {Error} If there is no profile info.
 * @returns {ProfileInfo|undefined} - profile info saved in file
 */
export async function getProfileInfoRNSS(
  blocking: boolean = false,
): Promise<ProfileInfo | undefined> {
  if (blocking) {
    const synced = async () => {
      return await readProfileInfoAsync();
    };
    return await connectionFsSync(synced);
  } else {
    return await readProfileInfoAsync();
  }
}

/**
 * Reads profile info from profile file
 * @returns {ProfileInfo|undefined} - profile info read from file. Returns undefined if the file doesn't exist
 */
async function readProfileInfoAsync(): Promise<ProfileInfo | undefined> {
  try {
    const session: any = await EncryptedStorage.getItem(sessionKey);
    return JSON.parse(session);
  } catch (error) {
    console.log('Error reading data from encrypted storage: ', error);
    return undefined;
  }
}

/**
 * Overwrites profile file with new info
 * @param {ProfileInfo} profile - the profile information to overwrite with
 */
async function writeProfileInfoAsync(profile: ProfileInfo): Promise<void> {
  await EncryptedStorage.setItem(sessionKey, JSON.stringify(profile));
}

/**
 * saves profile info to file
 * @param {ProfileInfo} profile - profile info to save
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveProfileInfoRNSS(
  profile: ProfileInfo,
  blocking: boolean = false,
): Promise<void> {
  if (blocking) {
    const synced = async () => {
      await writeProfileInfoAsync(profile);
    };
    await connectionFsSync(synced);
  } else {
    await writeProfileInfoAsync(profile);
  }
}
