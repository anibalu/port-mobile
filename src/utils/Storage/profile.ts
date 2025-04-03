import {ProfileInfo} from './RNSecure/secureProfileHandler';
import {
  getProfileInfoRNSS,
  saveProfileInfoRNSS,
} from './RNSecure/secureProfileHandler';
import {
  moveProfilePictureToProfileDirRNFS,
  removeProfilePictureRNFS,
} from './StorageRNFS/profileHandlers';
import {FileAttributes} from './StorageRNFS/interfaces';

/**
 * saves profile info to storage
 * @param {ProfileInfo | undefined} profile - profile info to be saved
 */
export async function saveProfileInfo(profile: ProfileInfo | undefined) {
  await saveProfileInfoRNSS(profile);
}

/**
 * returns saved profile info
 * @returns {ProfileInfo|undefined} - profile info saved, undefined if no data exists
 */
export async function getProfileInfo(): Promise<ProfileInfo | undefined> {
  return await getProfileInfoRNSS();
}

/**
 * makes a copy of the chosen profile picture in the profile dir.
 * @param {FileAttributes} file - file to make a copy of in profile dir
 * @returns {FileAttributes} - new destination of the profile picture.
 */
export async function moveProfilePictureToProfileDir(
  file: FileAttributes,
): Promise<FileAttributes> {
  return await moveProfilePictureToProfileDirRNFS(file);
}

/**
 * removes profile picture from storage
 * @param {FileAttributes} file - file to remove from storage
 */
export async function removeProfilePicture(file: FileAttributes) {
  await removeProfilePictureRNFS(file);
}
