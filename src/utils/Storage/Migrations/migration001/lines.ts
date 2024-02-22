import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Set up the lines table
 */
export default async function lines() {
  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS lines (
        lineId CHAR(32) PRIMARY KEY,
        name VARCHAR(64),
        displayPic VARCHAR(256),
        authenticated BOOL,
        disconnected BOOL,
        cryptoId CHAR(32),
        connectedOn VARCHAR(27),
        connectedUsing VARCHAR(64),
        recipientID CHAR(32)
    ) ;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully added the lines table');
    },
  );
}
