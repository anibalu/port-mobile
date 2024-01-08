import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Sety up storage for permissions
 * - Set up the permissions table
 * - Set up the permission presets table
 */
export default async function permissions() {
  await runSimpleQuery(
    `
  CREATE TABLE IF NOT EXISTS permissions (
    chatId CHAR(32) PRIMARY KEY,
    notifications BOOL,
    autoDownload BOOL,
    displayPicture BOOL,
    contactSharing BOOL,
    disappearingMessages INT
  ) ;
  `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully added the permissions table');
    },
  );

  await runSimpleQuery(
    `
  CREATE TABLE IF NOT EXISTS permissionPresets (
    presetId CHAR(32) PRIMARY KEY,
    name VARCHAR(16),
    isDefault BOOL,
    notifications BOOL,
    autoDownload BOOL,
    displayPicture BOOL,
    contactSharing BOOL,
    disappearingMessages INT,
    UNIQUE(presetId, name)
  ) ;
  `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully added the permissionPresets table',
      );
    },
  );
}
