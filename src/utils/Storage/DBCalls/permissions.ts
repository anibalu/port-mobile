import {defaultPermissions} from '@configs/constants';
import {runSimpleQuery} from './dbCommon';
import {
  Permissions,
  PermissionsEntry,
  PermissionsStrict,
  booleanKeysOfPermissions,
  numberKeysOfPermissions,
} from '@utils/ChatPermissions/interfaces';

/**
 * Converts number values to boolean values
 * @param a number value or null value
 * @returns boolean
 */
function toBool(a: number | null): boolean {
  if (a) {
    return true;
  } else {
    return false;
  }
}

/**
 * Track a new chat's permissions
 * @param permissionsId a permissionsId to track permissions for
 */
export async function newPermissionEntry(permissionsId: string) {
  await runSimpleQuery(
    `
    INSERT INTO permissions
    (permissionsId) VALUES (?) ;
    `,
    [permissionsId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

export async function addPermissionEntry(data: PermissionsEntry) {
  await runSimpleQuery(
    `
    INSERT INTO permissions (
      permissionsId, autoDownload, contactSharing, disappearingMessages, displayPicture, notifications,readReceipts) VALUES (?,?,?,?,?,?,?);
    `,
    [
      data.permissionsId,
      data.autoDownload,
      data.contactSharing,
      data.disappearingMessages,
      data.displayPicture,
      data.notifications,
      data.readReceipts,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

export async function getAllPermissions(): Promise<PermissionsEntry[]> {
  const permissions: PermissionsEntry[] = [];
  await runSimpleQuery('SELECT * FROM permissions;', [], (tx, results) => {
    const len = results.rows.length;
    for (let i = 0; i < len; i++) {
      const entry = results.rows.item(i);
      const match: PermissionsEntry = {
        ...defaultPermissions,
        permissionsId: entry.permissionsId,
      };
      booleanKeysOfPermissions.forEach(key => {
        match[key] = toBool(entry[key]);
      });
      numberKeysOfPermissions.forEach(key => {
        match[key] = entry[key];
      });
      permissions.push(match);
    }
  });
  return permissions;
}

/**
 * Get the saved permissions for a particular permissionsId
 * @param permissionsId a permissionsId to get associated permissions for
 * @returns the permissions for a given chat
 */
export async function getPermissions(
  permissionsId?: string,
): Promise<PermissionsStrict> {
  const match: PermissionsStrict = {...defaultPermissions};
  if (!permissionsId) {
    return match;
  }
  await runSimpleQuery(
    `
    SELECT *
    FROM permissions
    WHERE permissionsId = ? ;
    `,
    [permissionsId],
    (tx, results) => {
      if (results.rows.length > 0) {
        const obj = results.rows.item(0);
        booleanKeysOfPermissions.forEach(key => {
          match[key] = toBool(obj[key]);
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
 * @param permissionsId the permissionsId to update permissions for
 * @param update the updates to the permissions
 */
export async function updatePermissions(
  permissionsId: string,
  update: Permissions,
) {
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
      update.notifications,
      update.autoDownload,
      update.displayPicture,
      update.contactSharing,
      update.disappearingMessages,
      update.readReceipts,
      permissionsId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Delete the permissions for a permissionsId
 * @param permissionsId which permissionsId to delete permissions for
 */
export async function clearPermissions(permissionsId: string) {
  await runSimpleQuery(
    `
    DELETE FROM permissions
    WHERE permissionsId = ?
    `,
    [permissionsId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}
