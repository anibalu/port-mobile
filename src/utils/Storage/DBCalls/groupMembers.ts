import {runSimpleQuery, toBool} from './dbCommon';

export interface GroupMemberUpdate {
  joinedAt?: string;
  cryptoId?: string;
  isAdmin?: boolean;
  deleted?: boolean;
}

export interface GroupMember extends GroupMemberUpdate {
  memberId: string;
  pairHash: string;
  joinedAt: string;
  cryptoId: string;
  isAdmin: boolean;
  deleted: boolean;
}

export interface GroupMemberLoadedData extends GroupMember {
  name?: string | null;
  displayPic?: string | null;
}

/**
 * Add a member to a group
 * @param member details of group member
 */
export async function newMember(groupId: string, member: GroupMember) {
  await runSimpleQuery(
    `
    INSERT INTO groupMembers (
      groupId, 
      memberId, 
      pairHash,
      joinedAt,
      cryptoId,
      isAdmin,
      deleted 
    ) VALUES (?,?,?,?,?,?,FALSE)
    `,
    [
      groupId,
      member.memberId,
      member.pairHash,
      member.joinedAt,
      member.cryptoId,
      member.isAdmin,
    ],
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
): Promise<Array<GroupMemberLoadedData>> {
  const matches: Array<GroupMemberLoadedData> = [];
  await runSimpleQuery(
    `
    SELECT 
      member.memberId as memberId, 
      member.pairHash as pairHash, 
      member.joinedAt as joinedAt, 
      member.cryptoId as cryptoId, 
      member.isAdmin as isAdmin, 
      member.deleted as deleted,
      contacts.name as name,
      contacts.displayPic as displayPic
    FROM 
      (SELECT * FROM groupMembers WHERE groupId = ? AND deleted = FALSE) member
    LEFT JOIN
      contacts
      ON member.pairHash = contacts.pairHash
    ;`,
    [groupId],

    (tx, results) => {
      let row;
      for (let i = 0; i < results.rows.length; i++) {
        row = results.rows.item(i);
        row.deleted = toBool(row.deleted);
        row.isAdmin = toBool(row.isAdmin);
        matches.push(row);
      }
    },
  );
  return matches;
}

/**
 * Fetches all memberId for a group
 * @param groupId
 * @returns
 */
export async function getAllMemberIds(groupId: string): Promise<Array<string>> {
  const matches: Array<string> = [];
  await runSimpleQuery(
    `
    SELECT memberId
    FROM groupMembers
    WHERE groupId = ?;
    `,
    [groupId],

    (tx, results) => {
      if (results.rows.length > 0) {
        for (let i = 0; i < results.rows.length; i++) {
          const memberId = results.rows.item(i).memberId;
          matches.push(memberId);
        }
      }
    },
  );
  return matches;
}

/**
 * Get all the non-deleted members of a group
 * @param groupId a 32 character identifier for a group
 * @returns a list of active group members
 */
export async function getMemberCryptoPairs(
  groupId: string,
): Promise<Array<string[]>> {
  const matches: Array<string[]> = [];
  await runSimpleQuery(
    `
    SELECT memberId, cryptoId
    FROM groupMembers
    WHERE groupId = ? AND deleted = FALSE ;
    `,
    [groupId],

    (tx, results) => {
      for (let i = 0; i < results.rows.length; i++) {
        const pair = [
          results.rows.item(i).memberId,
          results.rows.item(i).cryptoId,
        ];
        matches.push(pair);
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
): Promise<GroupMemberLoadedData | null> {
  let match: GroupMemberLoadedData | null = null;
  await runSimpleQuery(
    `
    SELECT 
      member.memberId as memberId, 
      member.pairHash as pairHash, 
      member.joinedAt as joinedAt, 
      member.cryptoId as cryptoId, 
      member.isAdmin as isAdmin, 
      member.deleted as deleted,
      contacts.name as name,
      contacts.displayPic as displayPic
    FROM 
      (SELECT * FROM groupMembers WHERE groupId = ? AND memberId = ?) member
    LEFT JOIN
      contacts
      ON member.pairHash = contacts.pairHash
    ;`,
    [groupId, memberId],

    (tx, results) => {
      if (results.rows.length > 0) {
        const row = results.rows.item(0);
        row.deleted = toBool(row.deleted);
        row.isAdmin = toBool(row.isAdmin);
        match = row;
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
    joinedAt = COALESCE(?, joinedAt),
    cryptoId = COALESCE(?, cryptoId),
    isAdmin = COALESCE(?, isAdmin),
    deleted = COALESCE(?, deleted)
    WHERE groupId = ? AND memberId = ? ;
    `,
    [
      update.joinedAt,
      update.cryptoId,
      update.isAdmin,
      update.deleted,
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

/**
 * Completely delete a group member entry.
 * @param groupId
 * @param memberId
 */
export async function deleteMember(groupId: string, memberId: string) {
  await runSimpleQuery(
    `
    DELETE FROM groupMembers
    WHERE groupId = ? AND memberId = ? ;
    `,
    [groupId, memberId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

export interface GroupMemberEntry extends GroupMember {
  groupId: string;
}

/**
 * Get al group member entries straight from the database
 * @returns Unprocessed, unaugmented group member entries
 */
export async function getAllGroupMembers(): Promise<GroupMemberEntry[]> {
  const members: Array<GroupMemberEntry> = [];
  await runSimpleQuery(
    `
    SELECT 
      groupId,
      memberId, 
      pairHash, 
      joinedAt, 
      cryptoId, 
      isAdmin, 
      deleted
    FROM groupMembers
    ;`,
    [],
    (tx, results) => {
      let row;
      for (let i = 0; i < results.rows.length; i++) {
        row = results.rows.item(i);
        row.deleted = toBool(row.deleted);
        row.isAdmin = toBool(row.isAdmin);
        members.push(row);
      }
    },
  );
  return members;
}
