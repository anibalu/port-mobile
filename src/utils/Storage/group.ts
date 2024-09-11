import * as dbCalls from './DBCalls/group';

/**
 * Add a new group
 * @param group - data associated with group
 */
export async function addGroup(group: dbCalls.GroupData) {
  await dbCalls.addGroup(group);
}

/**
 * A 32 character string identifying a group
 * @param id a 32 character string identifying a group
 * @returns information associated with the group
 */
export async function getGroupData(
  id: string,
): Promise<dbCalls.GroupData | null> {
  return await dbCalls.getGroupData(id);
}

/**
 * Update an existing group
 * @param id a 32 character identifier for a group
 * @param update updates to be performed on a group
 */
export async function updateGroupData(
  id: string,
  update: dbCalls.GroupUpdateData,
) {
  await dbCalls.updateGroupData(id, update);
}

/**
 * Update a group's picture
 * @param id
 * @param groupPicture
 */
export async function updateGroupPicture(
  id: string,
  groupPicture: string | null,
) {
  await dbCalls.updateGroupPicture(id, groupPicture);
}

/**
 * Update a group's picture key
 * @param id
 * @param groupPictureKey
 */
export async function updateGroupPictureKey(
  id: string,
  groupPictureKey: string | null,
) {
  await dbCalls.updateGroupPictureKey(id, groupPictureKey);
}

/**
 * Delete a group entry
 * @param id a 32 character identifier for a group
 */
export async function deleteGroupData(id: string) {
  await dbCalls.deleteGroupData(id);
}

/**
 * Get information about every saved grouop
 * @returns Information about every saved group
 */
export async function getAllGroups() {
  return await dbCalls.getAllGroups();
}

/**
 * Find the groups you share in common with a contact
 * @param pairHash the pairHash of a contact
 * @returns Basic group information of common groups
 */
export async function getGroupsWithContact(
  pairHash: string,
): Promise<dbCalls.BasicGroupInfo[]> {
  return await dbCalls.getGroupsWithContact(pairHash);
}
