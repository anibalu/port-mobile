import {UnusedPortData, GroupPortDataUpdate} from '@utils/Ports/interfaces';
import {runSimpleQuery} from './dbCommon';
import {generateISOTimeStamp} from '@utils/Time';

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
		channel = COALESCE(?, channel),
    folderId = COALESCE(?, folderId)
		WHERE portId = ? ;
		`,
    [
      update.version,
      update.groupId,
      update.usedOnTimestamp,
      update.expiryTimestamp,
      update.channel,
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
): Promise<GroupPortDataUpdate | null> {
  let matchingEntry: GroupPortDataUpdate | null = null;
  await runSimpleQuery(
    `
    SELECT *
    FROM groupPorts
    WHERE portId = ?;
    `,
    [portId],

    (tx, results) => {
      if (results.rows.length > 0) {
        matchingEntry = results.rows.item(0);
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
    updateGroupPortData(matchingEntry.portId, {
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

// export async function testGroupPortData(): Promise<boolean> {
//   const id: string = '12345678901234567890123456789012';

//   const channel: string = 'AN EXAMPLE CHANNEL';
//   await newGroupPort(id);
//   if ((await getUnusedGroupPort('123')).portId) {
//     console.log('[DBCALLS PORTS] Able to get a groupPort for the wrong group');
//     return false;
//   }
//   const unusedGroupPortData = await getUnusedGroupPort(id);
//   if (unusedGroupPortData.portId !== id) {
//     console.log('[DBCALLS PORTS] failed to get portId for unusedGroupPortData');
//     return false;
//   }
//   if (unusedGroupPortData.remainingPorts !== 0) {
//     console.log(
//       '[DBCALLS PORTS] failed to get remaining ports count for unusedGroupPortData which should be 0',
//     );
//     return false;
//   }

//   await updateGroupPortData(id, {channel});
//   if ((await getGroupPortData(id)).channel !== channel) {
//     console.log(
//       '[DBCALLS PORTS] failed to updateGroupPortData as channel is not equal to getGroupPortData(id)).channel ',
//     );
//     return false;
//   }

//   await deleteGroupPort(id);
//   if ((await getGroupPortData(id)).channel) {
//     console.log(
//       '[DBCALLS PORTS] failed to deleteGroupPortData as channel is still present ',
//     );
//     return false;
//   }
//   console.log('[DBCALLS GROUPPORTS] Passed all tests');
//   return true;
// }
