import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * This creates the contacts table with values that already exist in connections and lines tables.
 */
export async function setupContactsTable() {
  await runSimpleQuery(
    `
        DROP TABLE IF EXISTS contacts;
      `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] deleted pre-existing contacts table');
    },
  );
  await runSimpleQuery(
    `
      CREATE TABLE IF NOT EXISTS contacts (
        pairHash CHAR(64) PRIMARY KEY,
        name VARCHAR(64),
        displayPic VARCHAR(256),
        connectedOn VARCHAR(27),
        connectionSource VARCHAR(128),
        notes VARCHAR(128)
      );
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] created the contacts table');
    },
  );
  //ignore call added to avoid throwing errors on duplicate insertion attempts
  await runSimpleQuery(
    `
      INSERT OR IGNORE INTO contacts (pairHash, name, displayPic, connectedOn, connectionSource)
        SELECT 
            pairHash,
            name,
            displayPic,
            connectedOn,
            connectedUsing as connectionSource
        FROM lines;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] populated entries in the contacts table');
    },
  );
}
