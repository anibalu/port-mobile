import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Set up storage for folders
 * - Set up the folders table
 */
export default async function folders() {
  await runSimpleQuery(
    `
  CREATE TABLE IF NOT EXISTS folders (
    folderId CHAR(32) PRIMARY KEY,
    name VARCHAR(16),
    permissionsId CHAR(32),
    FOREIGN KEY (permissionsId) REFERENCES permissions(permissionsId)
  ) ;
  `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully added the folders table');
    },
  );
}
