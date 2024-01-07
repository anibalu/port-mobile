import {runSimpleQuery} from './dbCommon';
import {SuperportData, SuperportDataUpdate} from '@utils/Ports/interfaces';
/**
 * Create a new super port entry
 * Add a new super port to the list
 * @param portId a 32 character string identifying a port
 */
export async function newSuperport(portId: string) {
  await runSimpleQuery(
    `
    INSERT INTO superPorts
    (portId) VALUES (?);
    `,
    [portId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Update an existing super port
 * @param portId a 32 character identifier for a super port
 * @param update updates to be performed on a super port
 */
export async function updateSuperportData(
  portId: string,
  update: SuperportDataUpdate,
) {
  await runSimpleQuery(
    `
		UPDATE superPorts
		SET
		version = COALESCE(?, version),
		label = COALESCE(?, label),
		usedOnTimestamp = COALESCE(?, usedOnTimestamp),
		createdOnTimestamp = COALESCE(?, createdOnTimestamp),
		channel = COALESCE(?, channel),
		cryptoId = COALESCE(?, cryptoId),
    connectionsPossible = COALESCE(?, connectionsPossible)
		WHERE portId = ? ;
		`,
    [
      update.version,
      update.label,
      update.usedOnTimestamp,
      update.createdOnTimestamp,
      update.channel,
      update.cryptoId,
      update.connectionsPossible,
      portId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * decrements connections possible by 1
 * @param portId
 */
export async function decrementConnectionsPossible(portId: string) {
  // Start the transaction
  await runSimpleQuery(
    `
    UPDATE superPorts
    SET
      connectionsPossible = CASE 
        WHEN connectionsPossible IS NULL THEN NULL 
        WHEN connectionsPossible > 0 THEN connectionsPossible - 1
        ELSE 0
      END
    WHERE portId = ?;
    `,
    [portId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * A 32 character string identifying a superport
 * to read a superport
 * @param portId a 32 character string identifying a superport
 * @returns information associated with the superport
 */
export async function getSuperportData(
  portId: string,
): Promise<SuperportDataUpdate | null> {
  let matchingEntry: SuperportDataUpdate | null = null;
  await runSimpleQuery(
    `
    SELECT version, label, usedOnTimestamp, createdOnTimestamp, channel, cryptoId, connectionsPossible
    FROM superPorts
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
 * Get all superports
 * @returns information associated with the superport
 */
export async function getAllSuperports(): Promise<SuperportData[]> {
  let matchingEntry: SuperportData[] = [];
  await runSimpleQuery(
    `
    SELECT *
    FROM superPorts
    WHERE createdOnTimestamp IS NOT NULL;
    `,
    [],

    (tx, results) => {
      for (let i = 0; i < results.rows.length; i++) {
        matchingEntry.push(results.rows.item(i));
      }
    },
  );
  return matchingEntry;
}

/**
 * Delete a superport entry
 * @param portId a 32 character identifier for a superport
 */
export async function deleteSuperPortData(portId: string) {
  await runSimpleQuery(
    `
    DELETE FROM superPorts
    WHERE portId = ? ;
    `,
    [portId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

// export async function testSuperPortData(): Promise<boolean> {
//   const id: string = '235672189204752675892201234s5678';

//   const channel: string = 'AN EXAMPLE SUPERPORTS';
//   await newSuperPort(id);

//   await updateSuperPortData(id, {channel});
//   if ((await getSuperPortData(id)).channel !== channel) {
//     console.log(
//       '[DBCALLS SUPERPORTS] failed to updatePortData as channel is not equal to getPortData(id)).channel ',
//     );
//     return false;
//   }

//   await getAllSuperPorts();

//   await deleteSuperPortData(id);
//   if ((await getSuperPortData(id)).channel) {
//     console.log(
//       '[DBCALLS SUPERPORTS] failed to deletePortData as channel is still present ',
//     );
//     return false;
//   }
//   console.log('[DBCALLS SUPERPORTS] Passed all tests');
//   return true;
// }
