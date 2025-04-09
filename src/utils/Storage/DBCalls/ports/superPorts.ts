import {runSimpleQuery, toBool} from '../dbCommon';

export interface SuperportDataUpdate {
  version?: string | null;
  label?: string | null;
  usedOnTimestamp?: string | null;
  createdOnTimestamp?: string | null;
  bundleId?: string | null; //bundleId to construct the port link
  cryptoId?: string | null;
  connectionsLimit?: number | null;
  connectionsMade?: number | null;
  folderId?: string | null;
  paused?: boolean | null;
  permissionsId?: string | null; //reference to permissions data
}

export interface SuperportData extends SuperportDataUpdate {
  portId: string;
  version: string;
  label: string;
  createdOnTimestamp: string;
  cryptoId: string;
  connectionsLimit: number;
  connectionsMade: number;
  folderId: string;
  paused: boolean;
  permissionsId: string;
}

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
 * Create a new superport entry
 * @param data - data associated with the superport.
 */
export async function addSuperport(data: SuperportData) {
  await runSimpleQuery(
    `
    INSERT INTO superPorts (
      portId,
      version,
      label,
      usedOnTimestamp,
      createdOnTimestamp,
      bundleId,
      cryptoId,
      connectionsLimit,
      connectionsMade,
      folderId,
      paused,
      permissionsId
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);`,
    [
      data.portId,
      data.version,
      data.label,
      data.usedOnTimestamp,
      data.createdOnTimestamp,
      data.bundleId,
      data.cryptoId,
      data.connectionsLimit,
      data.connectionsMade,
      data.folderId,
      data.paused,
      data.permissionsId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
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
		bundleId = COALESCE(?, bundleId),
		cryptoId = COALESCE(?, cryptoId),
    connectionsLimit = COALESCE(?, connectionsLimit),
    connectionsMade = COALESCE(?, connectionsMade),
    folderId = COALESCE(?, folderId),
    paused = COALESCE(?, paused),
    permissionsId = COALESCE(?, permissionsId)
		WHERE portId = ? ;
		`,
    [
      update.version,
      update.label,
      update.usedOnTimestamp,
      update.createdOnTimestamp,
      update.bundleId,
      update.cryptoId,
      update.connectionsLimit,
      update.connectionsMade,
      update.folderId,
      update.paused,
      update.permissionsId,
      portId,
    ],
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
): Promise<SuperportData | null> {
  let match: SuperportData | null = null;
  await runSimpleQuery(
    `
    SELECT *
    FROM superPorts
    WHERE portId = ?;
    `,
    [portId],

    (tx, results) => {
      if (results.rows.length > 0) {
        if (results.rows.item(0)?.createdOnTimestamp) {
          const matchingEntry = results.rows.item(0);
          matchingEntry.paused = toBool(matchingEntry.paused);
          match = matchingEntry;
        }
      }
    },
  );
  return match;
}

/**
 * Get all superports
 * @returns information associated with the superport
 */
export async function getAllSuperports(): Promise<SuperportData[]> {
  const matchingEntry: SuperportData[] = [];
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
 * increments connections made using superport by 1
 * @param portId
 */
export async function incrementConnectionsMade(
  portId: string,
  usedOnTimestamp: string,
) {
  // Start the transaction
  await runSimpleQuery(
    `
    UPDATE superPorts
    SET 
    connectionsMade = connectionsMade + 1,
    usedOnTimestamp = COALESCE(?, usedOnTimestamp)
    WHERE portId = ?;
    `,
    [usedOnTimestamp, portId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
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
