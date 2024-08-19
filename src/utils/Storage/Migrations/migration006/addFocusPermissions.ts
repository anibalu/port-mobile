import {
  defaultFolderId,
  defaultPermissions,
  defaultPermissionsId,
} from '@configs/constants';

import {ConnectionInfo} from '@utils/Storage/DBCalls/connections';
import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * This util sets the default(previously called Primary)
 * folder focus permission to true
 */
export async function setFocusPermissionForDefaultFolder() {
  // update primary folder name to default
  await runSimpleQuery(
    `
    UPDATE folders
    SET
    name = 'Default'
    WHERE folderId = ? ;
    `,
    [defaultFolderId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );

  // update folder permission of
  await runSimpleQuery(
    `
    UPDATE permissions
    SET
    focus = COALESCE(?, focus)
    WHERE permissionsId = ? ;
    `,
    [defaultPermissions.focus, defaultPermissionsId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
  // update permissions in all chats in a folder
  let connections: ConnectionInfo[] = [];
  await runSimpleQuery(
    `
    SELECT
      connections.chatId,
      connections.connectionType,
      connections.name,
      connections.text,
      connections.recentMessageType,
      connections.pathToDisplayPic,
      connections.readStatus,
      connections.authenticated,
      connections.timestamp,
      connections.newMessageCount,
      connections.disconnected,
      connections.latestMessageId,
      connections.folderId
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
    let permissionId = {};
    //update chat permissions to folder permissions
    await runSimpleQuery(
      `
    SELECT permissions.permissionsId
    FROM ((
      connections
    JOIN lines ON
      connections.chatId = lines.lineId)
    JOIN permissions ON
      lines.permissionsId = permissions.permissionsId)
    WHERE connections.chatId = ?;`,
      [connections[index].chatId],
      (tx, results) => {
        const len = results.rows.length;
        let entry;
        for (let i = 0; i < len; i++) {
          entry = results.rows.item(i);
          permissionId = entry.permissionsId;
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
      [defaultPermissions.focus, permissionId],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (tx, results) => {},
    );
  }
}
