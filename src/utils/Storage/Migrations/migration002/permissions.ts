import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Set up storage for permissions
 * - Set up the permissions table
 */
export default async function permissions() {
  await runSimpleQuery(
    `
  CREATE TABLE IF NOT EXISTS permissions (
    permissionsId CHAR(32) PRIMARY KEY,
    notifications BOOL,
    autoDownload BOOL,
    displayPicture BOOL,
    contactSharing BOOL,
    readReceipts BOOL,
    disappearingMessages INT
  ) ;
  `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully added the permissions table');
    },
  );
}
