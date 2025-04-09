import {runSimpleQuery, toBool} from '../dbCommon';

export interface AcceptedContactPortDataUpdate {
  pairHash?: string | null;
  owner?: boolean | null;
  version?: string | null;
  createdOnTimestamp?: string | null;
  cryptoId?: string | null;
}

export interface ContactPortDataUpdate extends AcceptedContactPortDataUpdate {
  usedOnTimestamp?: string | null;
  connectionsMade?: number | null;
  folderId?: string | null;
  paused?: boolean | null;
}

/**
 * Describes contact port data available to the contact port owner
 */
export interface ContactPortData extends ContactPortDataUpdate {
  portId: string;
  pairHash: string;
  owner: boolean;
  version: string;
  createdOnTimestamp: string;
  cryptoId: string;
  connectionsMade: number;
  folderId: string;
  paused: boolean;
}

/**
 * Describes contact port data available to the contact port's authorized party
 */
export interface AcceptedContactPortData extends AcceptedContactPortDataUpdate {
  portId: string;
  pairHash: string;
  owner: boolean;
  version: string;
  createdOnTimestamp: string;
  cryptoId: string;
}

export interface ContactPortTicket {
  ticketId: string;
  contactPortId: string;
  active: boolean;
}

/**
 * Adds a new active ticket to contact port tickets
 * @param data
 */
export async function addContactPortTicket(data: ContactPortTicket) {
  await runSimpleQuery(
    `
      INSERT INTO contactPortTickets (
        ticketId,
        contactPortId,
        active
      ) VALUES (?,?,?);`,
    [data.ticketId, data.contactPortId, true],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}

/**
 * Toggles an existing ticket as inactive.
 * @param ticketId
 * @param contactPortId
 */
export async function toggleTicketInactive(
  contactPortId: string,
  ticketId: string,
) {
  await runSimpleQuery(
    `
      UPDATE contactPortTickets
      SET
      active = FALSE
      WHERE ticketId = ? and contactPortId = ?;
      `,
    [ticketId, contactPortId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}

/**
 * Get a matching contact port ticket from storage
 * @param contactPortId
 * @param ticketId
 * @returns - contact port ticket if one is found
 */
export async function getContactPortTicket(
  contactPortId: string,
  ticketId: string,
): Promise<ContactPortTicket | null> {
  let match: ContactPortTicket | null = null;
  await runSimpleQuery(
    `
      SELECT *
      FROM contactPortTickets
      WHERE ticketId = ? and contactPortId = ?;
      `,
    [ticketId, contactPortId],
    (tx, results) => {
      if (results.rows.length > 0) {
        const matchingEntry = results.rows.item(0);
        matchingEntry.active = toBool(matchingEntry.active);
        match = matchingEntry;
      }
    },
  );
  return match;
}

/**
 * Create a new contact port entry
 * @param data - data associated with the contact port.
 */
export async function addContactPort(data: ContactPortData) {
  await runSimpleQuery(
    `
      INSERT INTO contactPorts (
        portId,
        pairHash,
        owner,
        version,
        usedOnTimestamp,
        createdOnTimestamp,
        cryptoId,
        connectionsMade,
        folderId,
        paused
      ) VALUES (?,?,?,?,?,?,?,?,?,?);`,
    [
      data.portId,
      data.pairHash,
      data.owner,
      data.version,
      data.usedOnTimestamp,
      data.createdOnTimestamp,
      data.cryptoId,
      data.connectionsMade,
      data.folderId,
      data.paused,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}

/**
 * Create new accepted contact port entry
 * @param data - data read from shared contact port.
 */
export async function acceptContactPort(data: AcceptedContactPortData) {
  await runSimpleQuery(
    `
      INSERT INTO contactPorts (
        portId,
        pairHash,
        owner,
        version,
        createdOnTimestamp,
        cryptoId
      ) VALUES (?,?,?,?,?,?);`,
    [
      data.portId,
      data.pairHash,
      false,
      data.version,
      data.createdOnTimestamp,
      data.cryptoId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}

/**
 * Update a contact port's data. only update allowed data is changed.
 * @param data - data being updated
 */
export async function updateContactPortData(
  portId: string,
  data: ContactPortDataUpdate,
) {
  await runSimpleQuery(
    `
      UPDATE contactPorts
      SET
      version = COALESCE(?, version),
      usedOnTimestamp = COALESCE(?, usedOnTimestamp),
      createdOnTimestamp = COALESCE(?, createdOnTimestamp),
      cryptoId = COALESCE(?, cryptoId),
      connectionsMade = COALESCE(?, connectionsMade),
      folderId = COALESCE(?, folderId),
      paused = COALESCE(?, paused)
      WHERE portId = ? ;
      `,
    [
      data.version,
      data.usedOnTimestamp,
      data.createdOnTimestamp,
      data.cryptoId,
      data.connectionsMade,
      data.folderId,
      data.paused,
      portId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}

/**
 * Get a created contact port
 * @param contactPortId
 * @returns - contact port data.
 */
export async function getContactPortData(
  contactPortId: string,
): Promise<ContactPortData | null> {
  let match: ContactPortData | null = null;
  await runSimpleQuery(
    `
      SELECT *
      FROM contactPorts
      WHERE portId = ? and owner = ?;
      `,
    [contactPortId, true],
    (tx, results) => {
      if (results.rows.length > 0) {
        if (results.rows.item(0)?.createdOnTimestamp) {
          const matchingEntry = results.rows.item(0);
          matchingEntry.owner = toBool(matchingEntry.owner);
          matchingEntry.paused = toBool(matchingEntry.paused);
          match = matchingEntry;
        }
      }
    },
  );
  return match;
}

export async function getAllContactPorts(): Promise<
  (ContactPortData | AcceptedContactPortData)[]
> {
  const matches: (ContactPortData | AcceptedContactPortData)[] = [];
  await runSimpleQuery(
    `
      SELECT *
      FROM contactPorts;
      `,
    [],
    (tx, results) => {
      const len = results.rows.length;
      for (let i = 0; i < len; i++) {
        const matchingEntry = results.rows.item(0);
        matchingEntry.owner = toBool(matchingEntry.owner);
        matchingEntry.paused = toBool(matchingEntry.paused);
        matches.push(matchingEntry);
      }
    },
  );
  return matches;
}

/**
 * Get an accepted contact port
 * @param contactPortId
 * @returns - contact port data.
 */
export async function getAcceptedContactPortData(
  contactPortId: string,
): Promise<AcceptedContactPortData | null> {
  let match: AcceptedContactPortData | null = null;
  await runSimpleQuery(
    `
      SELECT *
      FROM contactPorts
      WHERE portId = ? and owner = ?;
      `,
    [contactPortId, false],
    (tx, results) => {
      if (results.rows.length > 0) {
        if (results.rows.item(0)?.createdOnTimestamp) {
          const matchingEntry = results.rows.item(0);
          matchingEntry.owner = toBool(matchingEntry.owner);
          match = matchingEntry;
        }
      }
    },
  );
  return match;
}

/**
 * Get a created contact port for a particular chat
 * @param pairHash - pairHash associated with the chat
 * @returns - contact port data.
 */
export async function getContactPortDataFromPairHash(
  pairHash: string,
): Promise<ContactPortData | null> {
  let match: ContactPortData | null = null;
  await runSimpleQuery(
    `
      SELECT *
      FROM contactPorts
      WHERE pairHash = ? and owner = ?;
      `,
    [pairHash, true],
    (tx, results) => {
      if (results.rows.length > 0) {
        if (results.rows.item(0)?.createdOnTimestamp) {
          const matchingEntry = results.rows.item(0);
          matchingEntry.owner = toBool(matchingEntry.owner);
          matchingEntry.paused = toBool(matchingEntry.paused);
          match = matchingEntry;
        }
      }
    },
  );
  return match;
}

/**
 * Get a accepted contact port for a particular chat
 * @param pairHash - pairHash associated with the chat
 * @returns - accepted contact port data.
 */
export async function getAcceptedContactPortDataFromPairHash(
  pairHash: string,
): Promise<AcceptedContactPortData | null> {
  let match: AcceptedContactPortData | null = null;
  await runSimpleQuery(
    `
      SELECT *
      FROM contactPorts
      WHERE pairHash = ? and owner = ?;
      `,
    [pairHash, false],
    (tx, results) => {
      if (results.rows.length > 0) {
        if (results.rows.item(0)?.createdOnTimestamp) {
          const matchingEntry = results.rows.item(0);
          matchingEntry.owner = toBool(matchingEntry.owner);
          match = matchingEntry;
        }
      }
    },
  );
  return match;
}

/**
 * increments connections made using contact port by 1
 * @param portId
 */
export async function incrementConnectionsMade(
  portId: string,
  usedOnTimestamp: string,
) {
  // Start the transaction
  await runSimpleQuery(
    `
      UPDATE contactPorts
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
 * Delete a contact port entry
 * @param portId a 32 character identifier for a contact
 */
export async function deleteContactPortData(portId: string) {
  await runSimpleQuery(
    `
      DELETE FROM contactPorts
      WHERE portId = ? ;
      `,
    [portId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Delete the contact port entries for a line
 * (deletes both accepted and generated contact ports)
 * @param pairHash a 64 character identifier for a contact
 */
export async function deleteContactPortsAssociatedWithContact(
  pairHash: string,
) {
  const matches: ContactPortData[] = [];
  await runSimpleQuery(
    `
      SELECT *
      FROM contactPorts
      WHERE pairHash = ?;
      `,
    [pairHash],

    (tx, results) => {
      const len = results.rows.length;
      for (let i = 0; i < len; i++) {
        const entry = results.rows.item(i);
        entry.owner = toBool(entry.owner);
        entry.paused = toBool(entry.paused);
        matches.push(entry);
      }
    },
  );
  for (let index = 0; index < matches.length; index++) {
    await deleteContactPortData(matches[index].portId);
  }
}
