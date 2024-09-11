import * as dbCalls from './DBCalls/groupMembers';

/**
 * Add a member to a group
 * @param groupId groupId of the group
 * @param member details of group member
 */
export async function newMember(groupId: string, member: dbCalls.GroupMember) {
  await dbCalls.newMember(groupId, member);
}

/**
 * Get all the non-deleted members of a group
 * @param groupId a 32 character identifier for a group
 * @returns a list of active group members
 */
export async function getMembers(
  groupId: string,
): Promise<dbCalls.GroupMemberLoadedData[]> {
  return await dbCalls.getMembers(groupId);
}

export async function getGroupCryptoPairs(
  groupId: string,
): Promise<string[][]> {
  return await dbCalls.getMemberCryptoPairs(groupId);
}

/**
 * Get a particular group member's information
 * @param groupId a 32 character identifier for a group
 * @param memberId a 32 character identifier for a member of a group
 * @returns the member's details
 */
export async function getMember(
  groupId: string,
  memberId: string,
): Promise<dbCalls.GroupMemberLoadedData | null> {
  return await dbCalls.getMember(groupId, memberId);
}

/**
 * Fetches all memberId for a group
 * @param groupId
 * @returns
 */
export async function getAllMemberIds(groupId: string): Promise<Array<string>> {
  return await dbCalls.getAllMemberIds(groupId);
}

/**
 * Update information about a group member
 * @param groupId a 32 char identifier for a group
 * @param memberId a 32 char identifier for a member of a group
 * @param update the changes to be appliedf to this group member
 */
export async function updateMember(
  groupId: string,
  memberId: string,
  update: dbCalls.GroupMemberUpdate,
) {
  await dbCalls.updateMember(groupId, memberId, update);
}

/**
 * Mark a user as deleted
 * Does not actually remove them from the database so that their information
 * is always available so we can properly render messages for members that have
 * left a group.
 * @param groupId a 32 char identifier for a group
 * @param memberId a 32 char identifier for a member of a group
 */
export async function removeMember(groupId: string, memberId: string) {
  await dbCalls.removeMember(groupId, memberId);
}

/**
 * Completely delete a group member entry.
 * @param groupId
 * @param memberId
 */
export async function deleteMember(groupId: string, memberId: string) {
  await dbCalls.deleteMember(groupId, memberId);
}

/**
 * Get all group member entries straight from the database
 * @returns unprocessed group member data from all groups
 */
export async function getAllGroupMembers(): Promise<
  dbCalls.GroupMemberEntry[]
> {
  return await dbCalls.getAllGroupMembers();
}
