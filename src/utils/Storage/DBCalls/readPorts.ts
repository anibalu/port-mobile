import {runSimpleQuery} from './dbCommon';
import {ReadPortData} from '@utils/Ports/interfaces';

/**
 * Create a new readPorts entry
 * Add a new readPorts to the list
 * @param newPort the newly scanned port to save
 */
export async function newReadPort(newPort: ReadPortData) {
  await runSimpleQuery(
    `
    INSERT INTO readPorts (
      portId,
      version,
      target,
      name,
      description,
      usedOnTimestamp,
      expiryTimestamp,
      channel,
      cryptoId,
      permissionPresetId
    ) VALUES (?,?,?,?,?,?,?,?,?,?);
    `,
    [
      newPort.portId,
      newPort.version,
      newPort.target,
      newPort.name,
      newPort.description,
      newPort.usedOnTimestamp,
      newPort.expiryTimestamp,
      newPort.channel,
      newPort.cryptoId,
      newPort.permissionPresetId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Read all readPorts
 * @returns information associated with the port
 */
export async function getReadPorts(): Promise<Array<ReadPortData>> {
  const matches: Array<ReadPortData> = [];

  await runSimpleQuery(
    `
    SELECT *
    FROM readPorts;
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
 * A 32 character string identifying a port
 * to read a port
 * @param portId a 32 character string identifying a port
 * @returns information associated with the port
 */
export async function getReadPortData(
  portId: string,
): Promise<ReadPortData | null> {
  let matchingEntry: ReadPortData | null = null;
  await runSimpleQuery(
    `
    SELECT *
    FROM readPorts
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
 * Delete a readPorts entry
 * @param portId a 32 character identifier for a readPorts
 */
export async function deleteReadPortData(portId: string) {
  await runSimpleQuery(
    `
    DELETE FROM readPorts
    WHERE portId = ? ;
    `,
    [portId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

// export async function testReadPortData(): Promise<boolean> {
//   const id: string = '12345678901234567890123456789012';
//   await newReadPort({portId: id});

//   const readPorts = await getReadPorts();
//   if (readPorts.length !== 1 || readPorts[0].portId !== id) {
//     console.log('[DBCALLS PORTS] Did not find the expected readPort');
//     return false;
//   }
//   await deleteReadPortData(id);
//   if ((await getReadPorts()).length) {
//     console.log('[DBCALLS PORTS] Found a readPort when we expected none');
//     return false;
//   }
//   console.log('[DBCALLS READPORTS] Passed all tests');
//   return true;
// }
