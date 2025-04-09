import {
  defaultFolderInfo,
  defaultPermissions,
  defaultPermissionsId,
} from '@configs/constants';

import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Set up default entries in Permissions and Folders
 * - creates default entry in permissions table
 * - creates default folder entry with default permission entry
 */
export default async function addDefaultEntries() {
  // new permission entry
  await runSimpleQuery(
    `
    INSERT INTO permissions
    (permissionsId) VALUES (?) ;
    `,
    [defaultPermissionsId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );

  // update the new permission entry
  await runSimpleQuery(
    `
    UPDATE permissions
    SET
      notifications = COALESCE(?, notifications),
      autoDownload = COALESCE(?, autoDownload),
      displayPicture = COALESCE(?, displayPicture),
      contactSharing = COALESCE(?, contactSharing),
      disappearingMessages = COALESCE(?, disappearingMessages),
      readReceipts = COALESCE(?, readReceipts)
      WHERE permissionsId = ? ;
    `,
    [
      defaultPermissions.notifications,
      defaultPermissions.autoDownload,
      defaultPermissions.displayPicture,
      defaultPermissions.contactSharing,
      defaultPermissions.disappearingMessages,
      defaultPermissions.readReceipts,
      defaultPermissionsId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );

  // add a new folder
  await runSimpleQuery(
    `
      INSERT INTO folders
      (
        folderId,
        name,
        permissionsId
      ) VALUES (?,?,?);
      `,
    [
      defaultFolderInfo.folderId,
      defaultFolderInfo.name,
      defaultFolderInfo.permissionsId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}
