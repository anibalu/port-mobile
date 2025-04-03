import {generateISOTimeStamp} from '@utils/Time';
import {runSimpleQuery} from '../dbCommon';
import {UnusedPortData} from './interfaces';

export interface PortDataUpdate {
  version?: string | null;
  label?: string | null; //used as default name of contact
  usedOnTimestamp?: string | null; //when the port was made useable
  expiryTimestamp?: string | null; //when the port will expire
  bundleId?: string | null; //bundleId to construct the port link
  cryptoId?: string | null; //reference to crypto data
  folderId?: string | null; //reference to folder data
  permissionsId?: string | null; //reference to permissions data
}

export interface PortData extends PortDataUpdate {
  portId: string;
  version: string;
  usedOnTimestamp: string;
  cryptoId: string;
  folderId: string;
  permissionsId: string;
}

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
		bundleId = COALESCE(?, bundleId),
		cryptoId = COALESCE(?, cryptoId),
    folderId = COALESCE(?, folderId),
    permissionsId = COALESCE(?, permissionsId)
		WHERE portId = ? ;
		`,
    [
      update.version,
      update.label,
      update.usedOnTimestamp,
      update.expiryTimestamp,
      update.bundleId,
      update.cryptoId,
      update.folderId,
      update.permissionsId,
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
export async function getPortData(portId: string): Promise<PortData | null> {
  let matchingEntry: PortData | null = null;
  await runSimpleQuery(
    `
    SELECT *
    FROM myPorts
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
