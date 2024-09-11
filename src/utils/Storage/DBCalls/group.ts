import {runSimpleQuery, toBool} from './dbCommon';

export interface GroupPictureUpdateData {
  groupPicture?: string | null;
  groupPictureKey?: string | null;
}

export interface GroupUpdateData extends GroupPictureUpdateData {
  name?: string;
  joinedAt?: string;
  description?: string | null;
  amAdmin?: boolean;
  selfCryptoId?: string;
  permissionsId?: string;
  disconnected?: boolean;
  initialMemberInfoReceived?: boolean;
}

export interface GroupDataWithoutGroupId extends GroupUpdateData {
  name: string;
  joinedAt: string;
  amAdmin: boolean;
  selfCryptoId: string;
  permissionsId: string;
  disconnected: boolean;
}

export interface GroupData extends GroupDataWithoutGroupId {
  groupId: string;
}

/**
 * Add a new group
 * @param group - data associated with group
 */
export async function addGroup(group: GroupData) {
  await runSimpleQuery(
    `
    INSERT INTO groups (
      groupId,
      name,
      joinedAt,
      description,
      groupPicture,
      amAdmin,
      selfCryptoId,
      permissionsId,
      groupPictureKey,
      initialMemberInfoReceived,
      disconnected
    ) VALUES (?,?,?,?,?,?,?,?,?,?,FALSE);
    `,
    [
      group.groupId,
      group.name,
      group.joinedAt,
      group.description,
      group.groupPicture,
      group.amAdmin,
      group.selfCryptoId,
      group.permissionsId,
      group.groupPictureKey,
      group.initialMemberInfoReceived,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Get information about all groups, unprocessed, straight from the database
 * @returns stored information about all groups
 */
export async function getAllGroups(): Promise<GroupData[]> {
  const groups: GroupData[] = [];
  await runSimpleQuery(
    `
    SELECT
      groupId,
      name,
      joinedAt,
      description,
      groupPicture,
      amAdmin,
      selfCryptoId,
      permissionsId,
      groupPictureKey,
      initialMemberInfoReceived,
      disconnected
    FROM groups ;
    `,
    [],
    (tx, res) => {
      for (let i = 0; i < res.rows.length; i++) {
        groups.push(res.rows.item(i));
      }
    },
  );
  return groups;
}

/**
 * Update an existing group. group picture and group key need to updated separately as they can be reset to null.
 * @param id a 32 character identifier for a group
 * @param update updates to be performed on a group
 */
export async function updateGroupData(id: string, update: GroupUpdateData) {
  await runSimpleQuery(
    `
		UPDATE groups
		SET
		name = COALESCE(?, name),
		joinedAt = COALESCE(?, joinedAt),
		description = COALESCE(?, description),
		amAdmin = COALESCE(?, amAdmin),
    selfCryptoId = COALESCE(?, selfCryptoId),
    disconnected = COALESCE(?, disconnected),
    initialMemberInfoReceived = COALESCE(?, initialMemberInfoReceived),
    permissionsId = COALESCE(?, permissionsId)
		WHERE groupId = ? ;
		`,
    [
      update.name,
      update.joinedAt,
      update.description,
      update.amAdmin,
      update.selfCryptoId,
      update.disconnected,
      update.initialMemberInfoReceived,
      update.permissionsId,
      id,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
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
  await runSimpleQuery(
    `
		UPDATE groups
		SET
		groupPicture =  ?
		WHERE groupId = ? ;
		`,
    [groupPicture, id],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
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
  await runSimpleQuery(
    `
		UPDATE groups
		SET
		groupPictureKey =  ?
		WHERE groupId = ? ;
		`,
    [groupPictureKey, id],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * A 32 character string identifying a group
 * @param id a 32 character string identifying a group
 * @returns information associated with the group
 */
export async function getGroupData(id: string): Promise<GroupData | null> {
  let matchingEntry = null;
  await runSimpleQuery(
    `
    SELECT 
      groupId,
      name,
      joinedAt,
      description,
      groupPicture,
      groupPictureKey,
      amAdmin,
      disconnected,
      selfCryptoId,
      initialMemberInfoReceived,
      permissionsId
    FROM groups
    WHERE groupId = ?;
    `,
    [id],

    (tx, results) => {
      if (results.rows.length > 0) {
        matchingEntry = results.rows.item(0);
        matchingEntry.amAdmin = toBool(matchingEntry.amAdmin);
        matchingEntry.disconnected = toBool(matchingEntry.disconnected);
        matchingEntry.initialMemberInfoReceived = toBool(
          matchingEntry.initialMemberInfoReceived,
        );
      }
    },
  );
  return matchingEntry;
}

/**
 * Delete a group entry
 * @param id a 32 character identifier for a group
 */
export async function deleteGroupData(id: string) {
  await runSimpleQuery(
    `
    DELETE FROM groupMembers
    WHERE groupId = ? ;
    `,
    [id],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
  await runSimpleQuery(
    `
    DELETE FROM groups
    WHERE groupId = ? ;
    `,
    [id],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

export interface BasicGroupInfo {
  name: string;
  groupId: string;
  groupPictureURI: string;
  disconnected: boolean;
}

/**
 * Find the groups you share in common with a contact
 * @param pairHash the pairHash of a contact
 * @returns Basic group information of common groups
 */
export async function getGroupsWithContact(
  pairHash: string,
): Promise<BasicGroupInfo[]> {
  const commonGroups: BasicGroupInfo[] = [];
  await runSimpleQuery(
    `
    SELECT 
      groups.name as name,
      groups.groupId as groupId,
      groups.groupPicture as groupPictureURI,
      groups.disconnected as disconnected
    FROM
      groups JOIN groupMembers
      ON groups.groupId = groupMembers.groupId
    WHERE groupMembers.pairHash = ?
    ;
    `,
    [pairHash],
    (tx, res) => {
      for (let i = 0; i < res.rows.length; i++) {
        const entry = res.rows.item(i);
        entry.disconnected = toBool(entry.disconnected);
        commonGroups.push(entry);
      }
    },
  );
  return commonGroups;
}
