import {sessionKey} from '@configs/paths';
import {connectionFsSync} from '@utils/Synchronization';
import EncryptedStorage from 'react-native-encrypted-storage';
import {FileAttributes} from '../StorageRNFS/interfaces';

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
 * @param {ProfileInfo|undefined} profile - the profile information to overwrite with
 */
async function writeProfileInfoAsync(
  profile: ProfileInfo | undefined,
): Promise<void> {
  if (profile) {
    await EncryptedStorage.setItem(sessionKey, JSON.stringify(profile));
  } else {
    await EncryptedStorage.clear();
  }
}

/**
 * saves profile info to file
 * @param {ProfileInfo} profile - profile info to save
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveProfileInfoRNSS(
  profile: ProfileInfo | undefined,
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

export interface ProfileInfoUpdate {
  //name chosen by user
  name?: string;
  //Id assigned by the server to client. this is not permanent and will change frequently.
  clientId?: string;
  //user's private key for commmunication with server
  privateKey?: string;
  //details of user's profile picture
  profilePicInfo?: FileAttributes;
  //last backup time
  lastBackupTime?: string;
}

export interface ProfileInfo extends ProfileInfoUpdate {
  //name chosen by user
  name: string;
  //Id assigned by the server to client. this is not permanent and will change frequently.
  clientId: string;
  //user's private key for commmunication with server
  privateKey: string;
  //details of user's profile picture
  profilePicInfo: FileAttributes;
  //last backup time
  lastBackupTime?: string;
}

/**
 * If Profile has been created properly or not.
 */
export enum ProfileStatus {
  created,
  failed,
}
