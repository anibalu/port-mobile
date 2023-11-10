import {
  readDirectConnectionLinksRNFS,
  writeDirectConnectionLinksRNFS,
  writeNewDirectConnectionLinksRNFS,
  writeNewGroupConnectionLinksRNFS,
  readGroupConnectionLinksRNFS,
  writeGroupConnectionLinksRNFS,
} from './StorageRNFS/connectionLinksHandlers';

/**
 * adds new direct connection links to storage
 * @param {string[]} links - new direct connection links to add to storage
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveNewDirectConnectionLinks(
  links: Array<string>,
  blocking: boolean = false,
) {
  await writeNewDirectConnectionLinksRNFS(links, blocking);
}

/**
 * returns unused direct connection links in storage
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @returns {string[]} - unused direct connection links.
 */
export async function getUnusedDirectConnectionLinks(
  blocking: boolean = false,
) {
  return await readDirectConnectionLinksRNFS(blocking);
}

/**
 * overwrites storage with new direct connection links
 * @param {string[]} links - new direct connection links
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveDirectConnectionLinks(
  links: Array<string>,
  blocking: boolean = false,
) {
  await writeDirectConnectionLinksRNFS(links, blocking);
}

/**
 * adds new group connection links to storage
 * @param {string} groupId - groupId of group.
 * @param {string[]} links - new group connection links to add to storage
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveNewGroupConnectionLinks(
  groupId: string,
  links: Array<string>,
  blocking: boolean = false,
) {
  await writeNewGroupConnectionLinksRNFS(groupId, links, blocking);
}

/**
 * returns unused group connection links in storage
 * @param {string} groupId - groupId of group.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @returns {string[]} - unused direct connection links.
 */
export async function getUnusedGroupConnectionLinks(
  groupId: string,
  blocking: boolean = false,
) {
  return await readGroupConnectionLinksRNFS(groupId, blocking);
}

/**
 * overwrites storage with new group connection links
 * @param {string} groupId - groupId of group.
 * @param {string[]} links - new group connection links
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveGroupConnectionLinks(
  groupId: string,
  links: Array<string>,
  blocking: boolean = false,
) {
  await writeGroupConnectionLinksRNFS(groupId, links, blocking);
}
