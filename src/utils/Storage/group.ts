import {GroupData, GroupDataStrict} from '@utils/Groups/interfaces';
import * as dbCalls from './DBCalls/group';

/**
 * Create a new group entry
 * @param id a 32 character string identifying a group
 */
export async function newGroup(id: string) {
  await dbCalls.newGroup(id);
}

/**
 * A 32 character string identifying a group
 * @param id a 32 character string identifying a group
 * @returns information associated with the group
 */
export async function getGroupData(
  id: string,
): Promise<GroupDataStrict | null> {
  return await dbCalls.getGroupData(id);
}

/**
 * Update an existing group
 * @param id a 32 character identifier for a group
 * @param update updates to be performed on a group
 */
export async function updateGroupData(id: string, update: GroupData) {
  await dbCalls.updateGroupData(id, update);
}

/**
 * Delete a group entry
 * @param id a 32 character identifier for a group
 */
export async function deleteGroupData(id: string) {
  await dbCalls.deleteGroupData(id);
}
