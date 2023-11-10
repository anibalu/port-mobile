import {GroupInfo} from '../Groups/interfaces';
import {
  deleteGroupDisplayPicRNFS,
  getGroupInfoRNFS,
  readGroupDisplayPicAttributesRNFS,
  saveGroupInfoRNFS,
  writeGroupDisplayPicAttributesRNFS,
} from './StorageRNFS/groupsHandlers';

import {FileAttributes} from './sharedFile';

/**
 * saves group info to storage
 * @param {GroupInfo} group - group info to be saved
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveGroupInfo(
  group: GroupInfo,
  blocking: boolean = false,
) {
  await saveGroupInfoRNFS(group, blocking);
}

/**
 * returns saved group info
 * @param {string} groupId - group id who's information is to be fetched
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @returns {GroupInfo} - group info saved
 */
export async function getGroupInfo(groupId: string, blocking: boolean = false) {
  return await getGroupInfoRNFS(blocking, groupId);
}

/**
 * returns group display picture attributes
 * @param {string} groupId - groupId of the group.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @returns {Promise<FileAttributes>} - profile picture file attributes
 */
export async function getGroupDisplayPicAttributes(
  groupId: string,
  blocking: boolean = false,
): Promise<FileAttributes> {
  return await readGroupDisplayPicAttributesRNFS(groupId, blocking);
}

/**
 * saves group display picture attributes
 * @param {string} groupId - groupId of the group.
 * @param {FileAttributes} file - profile picture file attributes
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveGroupProfilePicAttributes(
  groupId: string,
  file: FileAttributes,
  blocking: boolean = false,
) {
  await writeGroupDisplayPicAttributesRNFS(groupId, file, blocking);
}

/**
 * deletes group display picture
 * @param {string} groupId - groupId of the group.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function deleteGroupDisplayPicture(
  groupId: string,
  blocking: boolean = false,
) {
  await deleteGroupDisplayPicRNFS(groupId, blocking);
}
