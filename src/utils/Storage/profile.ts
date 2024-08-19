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
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveProfileInfo(
  profile: ProfileInfo | undefined,
  blocking: boolean = false,
) {
  await saveProfileInfoRNSS(profile, blocking);
}

/**
 * returns saved profile info
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @returns {ProfileInfo|undefined} - profile info saved, undefined if no data exists
 */
export async function getProfileInfo(
  blocking: boolean = false,
): Promise<ProfileInfo | undefined> {
  return await getProfileInfoRNSS(blocking);
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

export async function removeProfilePicture(
  file: FileAttributes,
  blocking: boolean = true,
) {
  await removeProfilePictureRNFS(file, blocking);
}
