import {runSimpleQuery} from './dbCommon';
import {
  Permissions,
  booleanKeysOfPermissions,
  numberKeysOfPermissions,
} from '@utils/ChatPermissions/interfaces';

/**
 * Converts number values to boolean values
 * @param a number value or null value
 * @returns boolean
 */
function toBoolOrNull(a: number | null): boolean | null {
  if (a) {
    return true;
  } else if (a === 0) {
    return false;
  } else {
    return null;
  }
}

/**
 * Track a new chat's permissions
 * @param chatId a chatId to track permissions for
 */
export async function newPermissionEntry(chatId: string) {
  await runSimpleQuery(
    `
    INSERT INTO permissions
    (chatId) VALUES (?) ;
    `,
    [chatId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Get the saved permissions for a particular chatId
 * @param chatId a chatId to get associated permissions for
 * @returns the permissions for a given chat
 */
export async function getPermissions(chatId: string): Promise<Permissions> {
  let match: Permissions = {};
  await runSimpleQuery(
    `
    SELECT notifications, autoDownload, displayPicture, contactSharing, disappearingMessages, readReceipts
    FROM permissions
    WHERE chatId = ? ;
    `,
    [chatId],
    (tx, results) => {
      if (results.rows.length > 0) {
        const obj = results.rows.item(0);
        booleanKeysOfPermissions.forEach(key => {
          match[key] = toBoolOrNull(obj[key]);
        });
        numberKeysOfPermissions.forEach(key => {
          match[key] = obj[key];
        });
      }
    },
  );
  return match;
}

/**
 * Update the permissions for a chat
 * @param chatId the chatId for a chat to update permissions for
 * @param update the updates to the permissions
 */
export async function updatePermissions(chatId: string, update: Permissions) {
  runSimpleQuery(
    `
    UPDATE permissions
    SET
    notifications = COALESCE(?, notifications),
    autoDownload = COALESCE(?, autoDownload),
    displayPicture = COALESCE(?, displayPicture),
    contactSharing = COALESCE(?, contactSharing),
    disappearingMessages = COALESCE(?, disappearingMessages),
    readReceipts = COALESCE(?, readReceipts)
    WHERE chatId = ? ;
    `,
    [
      update.notifications,
      update.autoDownload,
      update.displayPicture,
      update.contactSharing,
      update.disappearingMessages,
      update.readReceipts,
      chatId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Delete the permissions for a chat
 * @param chatId which chat to delete permissions for
 */
export async function clearPermissions(chatId: string) {
  runSimpleQuery(
    `
    DELETE FROM permissions
    WHERE chatId = ?
    `,
    [chatId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Check whether basic usage of permissions helpers passes tests
 * @returns test success
 */
// export async function testPermissions(): Promise<boolean> {
//   const connection: ConnectionEntry = {
//     chatId: '12345678901234567890123456789012',
//     name: 'A TEST CONNECTION NAME',
//     connectionType: 0,
//     permissions: {},
//   };
//   await addConnection(connection);
//   await newPermissionEntry(connection.chatId);
//   if ((await getPermissions(connection.chatId)).notifications) {
//     console.log(
//       '[DBCALLS PERMISSIONS] Found incorrectly set initial permission',
//     );
//     return false;
//   }
//   await updatePermissions(connection.chatId, {notifications: true});
//   if (!(await getPermissions(connection.chatId)).notifications) {
//     console.log(
//       '[DBCALLS PERMISSIONS] Found incorrectly set permission: ',
//       await getPermissions(connection.chatId),
//     );
//     return false;
//   }
//   await clearPermissions(connection.chatId);
//   if ((await getPermissions(connection.chatId)).notifications) {
//     console.log('[DBCALLS PERMISSIONS] Found permissions after clearing');
//     return false;
//   }
//   await deleteConnection(connection.chatId); // Cleanup
//   console.log('[DBCALLS PERMISSIONS] All tests pass');
//   return true;
// }
