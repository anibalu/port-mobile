import {
  defaultFolderId,
  defaultPermissions,
  defaultPermissionsId,
} from '@configs/constants';

import {ConnectionInfo} from '@utils/Connections/interfaces';
import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * This util sets the default(previously called Primary)
 * folder focus permission to true
 */
export async function setFocusPermissionForDefaultFolder() {
  // update folder name
  const DEFAULT_NAME = 'Default';
  await runSimpleQuery(
    `
    UPDATE folders
    SET
    name = COALESCE(?, name)
    WHERE folderId = ? ;
    `,
    [DEFAULT_NAME, defaultFolderId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
  // update folder permission
  await runSimpleQuery(
    `
    UPDATE permissions
    SET
    notifications = COALESCE(?, notifications),
    autoDownload = COALESCE(?, autoDownload),
    displayPicture = COALESCE(?, displayPicture),
    contactSharing = COALESCE(?, contactSharing),
    disappearingMessages = COALESCE(?, disappearingMessages),
    readReceipts = COALESCE(?, readReceipts),
    focus = COALESCE(?, focus)
    WHERE permissionsId = ? ;
    `,
    [
      defaultPermissions.notifications,
      defaultPermissions.autoDownload,
      defaultPermissions.displayPicture,
      defaultPermissions.contactSharing,
      defaultPermissions.disappearingMessages,
      defaultPermissions.readReceipts,
      true,
      defaultPermissionsId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
  // update permissions in all chats in a folder
  let connections: ConnectionInfo[] = [];
  await runSimpleQuery(
    `
       SELECT
    connections.chatId,
FROM
    connections
LEFT JOIN
    folders ON connections.folderId = folders.folderId
    WHERE connections.folderId = ?
    ;
        `,
    [defaultFolderId],
    (tx, results) => {
      const len = results.rows.length;
      let entry;
      for (let i = 0; i < len; i++) {
        entry = results.rows.item(i);
        connections.push(entry);
      }
    },
  );

  for (let index = 0; index < connections.length; index++) {
    let permissionId = '';
    //update chat permissions to folder permissions
    await runSimpleQuery(
      `
    SELECT permissions.permissionsId
FROM ((connections 
JOIN lines ON connections.chatId = lines.lineId)
JOIN permissions ON lines.permissionsId = permissions.permissionsId)
WHERE connections.chatId = ?`,
      [connections[index].chatId],
      (tx, results) => {
        const len = results.rows.length;
        let entry;
        for (let i = 0; i < len; i++) {
          entry = results.rows.item(i);
          permissionId = entry;
        }
      },
    );
    await runSimpleQuery(
      `
    UPDATE permissions
    SET
    focus = COALESCE(?, focus)
    WHERE permissionsId = ? ;
    `,
      [true, permissionId],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (tx, results) => {},
    );
  }
}
