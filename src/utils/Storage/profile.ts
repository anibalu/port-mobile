import {ProfileInfo} from '../Profile/interfaces';
import {
  getProfileInfoRNSS,
  saveProfileInfoRNSS,
} from './RNSecure/secureProfileHandler';
import {
  deleteProfilePictureRNFS,
  readProfilePicAttributesRNFS,
  writeProfilePicAttributesRNFS,
} from './StorageRNFS/profileHandlers';
import {FileAttributes} from './sharedFile';

/**
 * saves profile info to storage
 * @param {ProfileInfo} profile - profile info to be saved
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveProfileInfo(
  profile: ProfileInfo,
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
 * returns profile picture attributes
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @returns {Promise<FileAttributes>} - profile picture file attributes
 */
export async function getProfilePicAttributes(
  blocking: boolean = false,
): Promise<FileAttributes> {
  return await readProfilePicAttributesRNFS(blocking);
}

/**
 * saves profile picture attributes
 * @param {FileAttributes} file - profile picture file attributes
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveProfilePicAttributes(
  file: FileAttributes,
  blocking: boolean = false,
) {
  await writeProfilePicAttributesRNFS(file, blocking);
}

/**
 * deletes profile picture
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function deleteProfilePicture(blocking: boolean = false) {
  await deleteProfilePictureRNFS(blocking);
}
