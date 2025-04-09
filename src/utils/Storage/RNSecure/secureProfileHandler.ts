import {sessionKey} from '@configs/paths';
import EncryptedStorage from 'react-native-encrypted-storage';
import {FileAttributes} from '../StorageRNFS/interfaces';

/**
 * reads profile info from encrypted storage
 * @throws {Error} If there is no profile info.
 * @returns {ProfileInfo|undefined} - profile info saved in file
 */
export async function getProfileInfoRNSS(): Promise<ProfileInfo | undefined> {
  try {
    const session: any = await EncryptedStorage.getItem(sessionKey);
    return JSON.parse(session);
  } catch {
    console.warn('Could not get profile from encrypted storage');
    return undefined;
  }
}

/**
 * saves profile info to file
 * @param {ProfileInfo} profile - profile info to save
 */
export async function saveProfileInfoRNSS(profile: ProfileInfo): Promise<void> {
  if (!profile) {
    throw new Error('Profile info is undefined');
  }
  await EncryptedStorage.setItem(sessionKey, JSON.stringify(profile));
}

/**
 * deletes profile info from file
 */
export async function deleteProfileInfoRNSS(): Promise<void> {
  await EncryptedStorage.clear();
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
  unknown,
}
