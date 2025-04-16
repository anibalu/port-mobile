import {generateISOTimeStamp} from '@utils/Time';

import {runSimpleQuery} from '../dbCommon';

import {UnusedPortData} from './interfaces';

export interface GroupPortDataUpdate {
  version?: string | null;
  groupId?: string | null;
  usedOnTimestamp?: string | null;
  expiryTimestamp?: string | null;
  bundleId?: string | null;
  folderId?: string | null; //deprecated
}

export interface GroupPortData extends GroupPortDataUpdate {
  portId: string;
  version: string;
  groupId: string;
  usedOnTimestamp: string;
}

/**
 * Create a new group port entry
 * Add a new group port to the list
 * @param portId a 32 character string identifying a group port
 */
export async function newGroupPort(groupId: string, portId: string) {
  await runSimpleQuery(
    `
    INSERT INTO groupPorts
    (portId, groupId) VALUES (?,?);
    `,
    [portId, groupId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Update an existing groupPorts
 * @param portId a 32 character identifier for a groupPorts
 * @param update updates to be performed on a groupPorts
 */
export async function updateGroupPortData(
  portId: string,
  update: GroupPortDataUpdate,
) {
  await runSimpleQuery(
    `
		UPDATE groupPorts
		SET
		version = COALESCE(?, version),
		groupId = COALESCE(?, groupId),
		usedOnTimestamp = COALESCE(?, usedOnTimestamp),
		expiryTimestamp = COALESCE(?, expiryTimestamp),
		bundleId = COALESCE(?, bundleId),
    folderId = COALESCE(?, folderId)
		WHERE portId = ? ;
		`,
    [
      update.version,
      update.groupId,
      update.usedOnTimestamp,
      update.expiryTimestamp,
      update.bundleId,
      update.folderId,
      portId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * A 32 character string identifying a groupPorts
 * to read a groupPorts
 * @param portId a 32 character string identifying a groupPorts
 * @returns information associated with the groupPorts
 */
export async function getGroupPortData(
  portId: string,
): Promise<GroupPortData | null> {
  let matchingEntry: GroupPortData | null = null;
  await runSimpleQuery(
    `
    SELECT *
    FROM groupPorts
    WHERE portId = ?;
    `,
    [portId],

    (tx, results) => {
      if (results.rows.length > 0) {
        if (results.rows.item(0)?.usedOnTimestamp) {
          matchingEntry = results.rows.item(0);
        }
      }
    },
  );
  return matchingEntry;
}

/**
 * A get an unused GroupPort
 * @returns information associated with the GroupPort
 */
export async function getUnusedGroupPort(
  groupId: string,
): Promise<UnusedPortData> {
  let matchingEntry = {portId: null};
  let remainingPorts = 0;

  await runSimpleQuery(
    `
    SELECT portId
    FROM groupPorts
    WHERE groupId = ? AND usedOnTimestamp IS NULL;
    `,
    [groupId],

    (tx, results) => {
      if (results.rows.length > 0) {
        matchingEntry = results.rows.item(0);
      }
      remainingPorts = results.rows.length - 1;
    },
  );
  if (matchingEntry.portId) {
    await updateGroupPortData(matchingEntry.portId, {
      usedOnTimestamp: generateISOTimeStamp(),
    });
  }
  return {portId: matchingEntry.portId, remainingPorts};
}

/**
 * Delete a groupPorts entry
 * @param portId a 32 character identifier for a groupPorts
 */
export async function deleteGroupPort(portId: string) {
  await runSimpleQuery(
    `
    DELETE FROM groupPorts
    WHERE portId = ? ;
    `,
    [portId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}
