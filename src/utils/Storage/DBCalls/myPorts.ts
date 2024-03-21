import {generateISOTimeStamp} from '@utils/Time';
import {runSimpleQuery} from './dbCommon';
import {
  PortData,
  PortDataUpdate,
  UnusedPortData,
} from '@utils/Ports/interfaces';

/**
 * Create a new port entry
 * Add a new port to the list
 * @param portId a 32 character string identifying a port
 */
export async function newPort(portId: string) {
  await runSimpleQuery(
    `
    INSERT INTO myPorts
    (portId) VALUES (?);
    `,
    [portId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Update an existing port
 * @param portId a 32 character identifier for a port
 * @param update updates to be performed on a port
 */
export async function updatePortData(portId: string, update: PortDataUpdate) {
  await runSimpleQuery(
    `
		UPDATE myPorts
		SET
		version = COALESCE(?, version),
		label = COALESCE(?, label),
		usedOnTimestamp = COALESCE(?, usedOnTimestamp),
		expiryTimestamp = COALESCE(?, expiryTimestamp),
		channel = COALESCE(?, channel),
		cryptoId = COALESCE(?, cryptoId),
    folderId = COALESCE(?, folderId)
		WHERE portId = ? ;
		`,
    [
      update.version,
      update.label,
      update.usedOnTimestamp,
      update.expiryTimestamp,
      update.channel,
      update.cryptoId,
      update.folderId,
      portId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * A 32 character string identifying a port
 * to read a port
 * @param portId a 32 character string identifying a port
 * @returns information associated with the port
 */
export async function getPortData(
  portId: string,
): Promise<PortDataUpdate | null> {
  let matchingEntry: PortDataUpdate | null = null;
  await runSimpleQuery(
    `
    SELECT *
    FROM myPorts
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
 * A get an unused port
 * @returns information associated with the port
 */
export async function getUnusedPort(): Promise<UnusedPortData> {
  let matchingEntry = {portId: null};
  let remainingPorts = 0;

  await runSimpleQuery(
    `
    SELECT portId
    FROM myPorts
    WHERE usedOnTimestamp IS NULL;
    `,
    [],

    (tx, results) => {
      if (results.rows.length > 0) {
        matchingEntry = results.rows.item(0);
      }
      remainingPorts = results.rows.length - 1;
    },
  );
  if (matchingEntry.portId) {
    updatePortData(matchingEntry.portId, {
      usedOnTimestamp: generateISOTimeStamp(),
    });
  }
  return {portId: matchingEntry.portId, remainingPorts};
}

/**
 * Returns all generated ports
 * @returns all ports which have been used.
 */
export async function getUsedPorts(): Promise<PortData[]> {
  const matches: PortData[] = [];
  await runSimpleQuery(
    `
    SELECT * FROM myPorts
    WHERE usedOnTimestamp IS NOT NULL;
    `,
    [],

    (tx, results) => {
      for (let i = 0; i < results.rows.length; i++) {
        matches.push(results.rows.item(i));
      }
    },
  );
  return matches;
}

/**
 * Delete a port entry
 * @param portId a 32 character identifier for a port
 */
export async function deletePortData(portId: string) {
  await runSimpleQuery(
    `
    DELETE FROM myPorts
    WHERE portId = ? ;
    `,
    [portId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

// export async function testPortData(): Promise<boolean> {
//   const id: string = '12345678901234567890123456789012';

//   const channel: string = 'AN EXAMPLE PORT';
//   await newPort(id);
//   const unusedPortData = await getUnusedPort();
//   if (unusedPortData.portId !== id) {
//     console.log('[DBCALLS PORTS] failed to get portId for unusedPortData');
//     return false;
//   }
//   if (unusedPortData.remainingPorts !== 0) {
//     console.log(
//       '[DBCALLS PORTS] failed to get remaining ports count for unusedPortData which should be 0',
//     );
//     return false;
//   }

//   await updatePortData(id, {channel});
//   if ((await getPortData(id)).channel !== channel) {
//     console.log(
//       '[DBCALLS PORTS] failed to updatePortData as channel is not equal to getPortData(id)).channel ',
//     );
//     return false;
//   }

//   await deletePortData(id);
//   if ((await getPortData(id)).channel) {
//     console.log(
//       '[DBCALLS PORTS] failed to deletePortData as channel is still present ',
//     );
//     return false;
//   }
//   console.log('[DBCALLS PORTS] Passed all tests');
//   return true;
// }
