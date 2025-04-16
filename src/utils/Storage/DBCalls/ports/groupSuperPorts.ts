import {runSimpleQuery, toBool} from '../dbCommon';

/**
 * Description of Group SuperPort fields that can be updated.
 */
export interface GroupSuperportDataUpdate {
  version?: string | null;
  paused?: boolean | null;
  bundleId?: string | null;
}

/**
 * Description of Group SuperPort fields.
 */
export interface GroupSuperportData extends GroupSuperportDataUpdate {
  portId: string;
  version: string;
  groupId: string;
  paused: boolean;
  bundleId?: string | null;
}

/**
 * Create a new group superport entry
 * @param data - data associated with the group superport.
 */
export async function addGroupSuperport(data: GroupSuperportData) {
  await runSimpleQuery(
    `
    INSERT INTO groupSuperPorts (
      portId,
      version,
      bundleId,
      paused,
      groupId
    ) VALUES (?,?,?,?,?);`,
    [data.portId, data.version, data.bundleId, data.paused, data.groupId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}

/**
 * Update an existing group super port
 * @param portId a 32 character identifier for a group super port
 * @param update updates to be performed on a group super port
 */
export async function updateGroupSuperportData(
  portId: string,
  update: GroupSuperportDataUpdate,
) {
  await runSimpleQuery(
    `
		UPDATE groupSuperPorts
		SET
		version = COALESCE(?, version),
        bundleId = COALESCE(?, bundleId),
        paused = COALESCE(?, paused)
		WHERE portId = ? ;
		`,
    [update.version, update.bundleId, update.paused, portId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Get the group superport associated with a group.
 * @param groupId a 32 character string identifying a group.
 * @returns information associated with the group superport if one exists.
 */
export async function getGroupSuperportDataFromGroupId(
  groupId: string,
): Promise<GroupSuperportData | null> {
  let match: GroupSuperportData | null = null;
  await runSimpleQuery(
    `
    SELECT *
    FROM groupSuperPorts
    WHERE groupId = ?;
    `,
    [groupId],

    (tx, results) => {
      if (results.rows.length > 0) {
        const matchingEntry = results.rows.item(0);
        matchingEntry.paused = toBool(matchingEntry.paused);
        match = matchingEntry;
      }
    },
  );
  return match;
}

/**
 * Get the group superport associated with a portId.
 * @param portId a 32 character string identifying a group superport.
 * @returns information associated with the group superport if one exists.
 */
export async function getGroupSuperportData(
  portId: string,
): Promise<GroupSuperportData | null> {
  let match: GroupSuperportData | null = null;
  await runSimpleQuery(
    `
    SELECT *
    FROM groupSuperPorts
    WHERE portId = ?;
    `,
    [portId],

    (tx, results) => {
      if (results.rows.length > 0) {
        const matchingEntry = results.rows.item(0);
        matchingEntry.paused = toBool(matchingEntry.paused);
        match = matchingEntry;
      }
    },
  );
  return match;
}

/**
 * Delete a group superport entry
 * @param portId a 32 character identifier for a group superport
 */
export async function deleteGroupSuperPortData(portId: string) {
  await runSimpleQuery(
    `
    DELETE FROM groupSuperPorts
    WHERE portId = ? ;
    `,
    [portId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}
