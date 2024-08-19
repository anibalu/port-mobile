import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Create the contact port tickets table
 */
export async function addContactPortTickets() {
  await runSimpleQuery(
    `
      CREATE TABLE IF NOT EXISTS contactPortTickets (
          ticketId CHAR(32) NOT NULL,
          contactPortId CHAR(32) NOT NULL,
          active BOOL,
          UNIQUE (ticketId, contactPortId)
          ) ;
      `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully added the contact port tickets table',
      );
    },
  );
}

/**
 * Create the contact ports table
 */
export async function addContactPorts() {
  await runSimpleQuery(
    `
        CREATE TABLE IF NOT EXISTS contactPorts (
          portId CHAR(32) PRIMARY KEY,
          pairHash CHAR(64),
          owner BOOL,
          version VARCHAR(16),
          usedOnTimestamp VARCHAR(27),
          createdOnTimestamp VARCHAR(27),
          cryptoId CHAR(32),
          connectionsMade INT UNSIGNED,
          folderId CHAR(32),
          paused BOOL,
          FOREIGN KEY (folderId) REFERENCES folders(folderId),
          UNIQUE (pairHash, owner)
        ) ;
        `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully added the contact ports table');
    },
  );
}

/**
 * Alter read ports table to accept contact ports
 */
export async function addTicketColumnToReadPortTable() {
  await runSimpleQuery(
    `
    ALTER TABLE readPorts
    ADD COLUMN ticket CHAR(32);
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully added column ticket to read ports table',
      );
    },
  );
}
