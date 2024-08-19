import {runSimpleQuery, toBool} from './dbCommon';
import {
  GroupData,
  GroupDataEntry,
  GroupDataStrict,
} from '@utils/Groups/interfaces';

/**
 * Create a new group entry
 * @param id a 32 character string identifying a group
 */
export async function newGroup(id: string) {
  await runSimpleQuery(
    `
    INSERT INTO groups
    (groupId) VALUES (?);
    `,
    [id],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

export async function getAllGroups(): Promise<GroupDataEntry[]> {
  const groups: GroupDataEntry[] = [];
  await runSimpleQuery('SELECT * FROM groups;', [], (tx, results) => {
    const len = results.rows.length;
    let entry;
    for (let i = 0; i < len; i++) {
      entry = results.rows.item(i);
      entry.amAdmin = toBool(entry.amAdmin);
      groups.push(results.rows.item(i));
    }
  });
  return groups;
}

/**
 * A 32 character string identifying a group
 * @param id a 32 character string identifying a group
 * @returns information associated with the group
 */
export async function getGroupData(
  id: string,
): Promise<GroupDataStrict | null> {
  let matchingEntry = null;
  await runSimpleQuery(
    `
    SELECT *
    FROM groups
    WHERE groupId = ?;
    `,
    [id],

    (tx, results) => {
      if (results.rows.length > 0) {
        matchingEntry = results.rows.item(0);
        matchingEntry.amAdmin = toBool(matchingEntry.amAdmin);
      }
    },
  );
  return matchingEntry;
}

/**
 * Update an existing group
 * @param id a 32 character identifier for a group
 * @param update updates to be performed on a group
 */
export async function updateGroupData(id: string, update: GroupData) {
  await runSimpleQuery(
    `
		UPDATE groups
		SET
		name = COALESCE(?, name),
		joinedAt = COALESCE(?, joinedAt),
		description = COALESCE(?, description),
		groupPicture = COALESCE(?, groupPicture),
		amAdmin = COALESCE(?, amAdmin),
    selfCryptoId = COALESCE(?, selfCryptoId),
    permissionsId = COALESCE(?, permissionsId)
		WHERE groupId = ? ;
		`,
    [
      update.name,
      update.joinedAt,
      update.description,
      update.groupPicture,
      update.amAdmin,
      update.selfCryptoId,
      update.permissionsId,
      id,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Delete a group entry
 * @param id a 32 character identifier for a group
 */
export async function deleteGroupData(id: string) {
  await runSimpleQuery(
    `
    DELETE FROM groups
    WHERE groupId = ? ;
    `,
    [id],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
  await runSimpleQuery(
    `
    DELETE FROM groupMembers
    WHERE groupId = ? ;
    `,
    [id],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}
