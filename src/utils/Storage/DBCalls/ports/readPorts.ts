import {generateISOTimeStamp} from '@utils/Time';
import {runSimpleQuery} from '../dbCommon';
import {BundleTarget} from './interfaces';

/**
 * Describes the data available in a read port (port, superport, group port).
 */
export interface ReadPortData {
  portId: string;
  version: string;
  target: BundleTarget;
  name: string;
  description?: string | null;
  usedOnTimestamp: string;
  expiryTimestamp?: string | null;
  channel?: string | null;
  cryptoId: string;
  folderId: string;
  ticket?: string | null;
}

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
      folderId,
      ticket
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?);
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
      newPort.folderId,
      newPort.ticket,
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
 * expire a read port
 * @param portId a 32 character identifier for a read port
 */
export async function expireReadPort(portId: string) {
  await runSimpleQuery(
    `
		UPDATE readPorts
		SET
		expiryTimestamp = ?
		WHERE portId = ? ;
		`,
    [generateISOTimeStamp(), portId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
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
