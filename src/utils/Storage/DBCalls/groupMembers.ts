import {runSimpleQuery} from './dbCommon';
import {GroupMemberUpdate, GroupMemberStrict} from '@utils/Groups/interfaces';

/**
 * Add a member to a group
 * @param groupId a 32 char identifier for a group
 * @param memberId a 32 character identifier for a member of a group
 */
export async function newMember(groupId: string, memberId: string) {
  await runSimpleQuery(
    `
    INSERT INTO groupMembers
    (groupId, memberId, deleted) VALUES (?, ?, FALSE)
    `,
    [groupId, memberId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Get all the non-deleted members of a group
 * @param groupId a 32 character identifier for a group
 * @returns a list of active group members
 */
export async function getMembers(
  groupId: string,
): Promise<Array<GroupMemberStrict>> {
  const matches: Array<GroupMemberStrict> = [];
  await runSimpleQuery(
    `
    SELECT name, memberId, joinedAt, cryptoId, isAdmin
    FROM groupMembers
    WHERE groupId = ? AND deleted = FALSE ;
    `,
    [groupId],

    (tx, results) => {
      for (let i = 0; i < results.rows.length; i++) {
        matches.push(results.rows.item(i));
      }
    },
  );
  return matches;
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
): Promise<GroupMemberStrict | null> {
  let match: GroupMemberStrict | null = null;
  await runSimpleQuery(
    `
    SELECT name, memberId, joinedAt, cryptoId, isAdmin
    FROM groupMembers
    WHERE groupId = ? and memberId = ? ;
    `,
    [groupId, memberId],

    (tx, results) => {
      if (results.rows.length > 0) {
        match = results.rows.item(0);
      }
    },
  );
  return match;
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
  update: GroupMemberUpdate,
) {
  await runSimpleQuery(
    `
    UPDATE groupMembers
    SET
    name = COALESCE(?, name),
    joinedAt = COALESCE(?, joinedAt),
    cryptoId = COALESCE(?, cryptoId),
    isAdmin = COALESCE(?, isAdmin)
    WHERE groupId = ? AND memberId = ? ;
    `,
    [
      update.name,
      update.joinedAt,
      update.cryptoId,
      update.isAdmin,
      groupId,
      memberId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
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
  await runSimpleQuery(
    `
    UPDATE groupMembers
    SET 
    deleted = TRUE
    WHERE groupId = ? AND memberId = ? ;
    `,
    [groupId, memberId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

// export async function testGroupMembers(): Promise<boolean> {
//   const id = '12345678901234567890123456789012';
//   const name = 'SOME TEST NAME';
//   await newGroup(id);
//   if ((await getMembers(id)).length) {
//     console.log(
//       "[DBCALLS GROUPMEMBERS] Found a member when there shouldn't be any",
//     );
//     return false;
//   }
//   await newMember(id, id);
//   if ((await getMembers(id)).length < 1) {
//     console.log(
//       '[DBCALLS GROUPMEMBERS] Found no member when there should be some',
//     );
//     return false;
//   }
//   await updateMember(id, id, {name});
//   if ((await getMember(id, id)).name !== name) {
//     console.log('[DBCALLS GROUPMEMBERS] Name update appears to have failed');
//     return false;
//   }
//   await removeMember(id, id);
//   if ((await getMembers(id)).length) {
//     console.log(
//       "[DBCALLS GROUPMEMBERS] Found a member when there shouldn't be any",
//     );
//     return false;
//   }
//   if ((await getMember(id, id)).name !== name) {
//     console.log(
//       "[DBCALLS GROUPMEMBERS] Unable to get a 'deleted' member's name for an existing group",
//     );
//     return false;
//   }
//   await deleteGroupData(id);
//   if ((await getMember(id, id)).name) {
//     console.log(
//       "[DBCALLS GROUPMEMBERS] Able to access a deleted group's member",
//       await getMember(id, id),
//     );
//     return false;
//   }
//   console.log('[DBCALLS GROUPMEMBERS] Successfully passed all tests');

//   return true;
// }
