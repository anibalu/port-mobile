import {defaultFolderId} from '@configs/constants';
import {runSimpleQuery} from './dbCommon';
import {FolderInfo, FolderInfoWithUnread} from '@utils/ChatFolders/interfaces';
import {getPermissions} from './permissions';
import {PermissionsStrict} from '@utils/ChatPermissions/interfaces';
import {getNewMessageCount} from './connections';

/**
 * Save a new folder.
 * @param folder - folder info to save
 */
export async function addNewFolder(folder: FolderInfo) {
  await runSimpleQuery(
    `
      INSERT INTO folders
      (
        folderId,
        name,
        permissionsId
      ) VALUES (?,?,?);
      `,
    [folder.folderId, folder.name, folder.permissionsId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Fetches the permissions for a folder
 * @param folderId
 * @returns permissions for the folder
 */
export async function getFolderPermissions(
  folderId: string,
): Promise<PermissionsStrict> {
  let match: string = defaultFolderId;
  await runSimpleQuery(
    `
    SELECT *
    FROM folders
    WHERE folderId = ? ;
    `,
    [folderId],
    (tx, results) => {
      if (results.rows.length > 0) {
        const obj = results.rows.item(0);
        match = obj.permissionsId;
      }
    },
  );
  return await getPermissions(match);
}

/**
 * Fetch folder
 * @returns - folder
 */
export async function getFolder(folderId: string): Promise<FolderInfo | null> {
  let match: FolderInfo | null = null;
  await runSimpleQuery(
    `
    SELECT * FROM folders
    WHERE folderId = ?;
    `,
    [folderId],
    (tx, results) => {
      const len = results.rows.length;
      if (len > 0) {
        match = results.rows.item(0);
      }
    },
  );
  return match;
}

/**
 * Fetch all folders
 * @returns - list of folders
 */
export async function getAllFolders(): Promise<FolderInfo[]> {
  let matches: FolderInfo[] = [];
  await runSimpleQuery(
    `
    SELECT *
    FROM folders;
    `,
    [],
    (tx, results) => {
      const len = results.rows.length;
      for (let i = 0; i < len; i++) {
        matches.push(results.rows.item(i));
      }
    },
  );
  return matches;
}

/**
 * Fetch all folders with unread count
 * @returns - list of folders
 */
export async function getAllFoldersWithUnreadCount(): Promise<
  FolderInfoWithUnread[]
> {
  let matches: FolderInfoWithUnread[] = [];
  await runSimpleQuery(
    `
    SELECT *
    FROM folders;
    `,
    [],
    (tx, results) => {
      const len = results.rows.length;
      for (let i = 0; i < len; i++) {
        matches.push({...results.rows.item(i), unread: 0});
      }
    },
  );
  for (let index = 0; index < matches.length; index++) {
    matches[index].unread = await getNewMessageCount(matches[index].folderId);
  }
  return matches;
}

/**
 * Update a folder name
 */
export async function updateFolderName(folderId: string, newName: string) {
  await runSimpleQuery(
    `
    UPDATE folders
    SET
    name = COALESCE(?, name)
    WHERE folderId = ? ;
    `,
    [newName, folderId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Deletes a folder
 * @param folderId - folder to be deleted
 */
export async function deleteFolder(folderId: string) {
  await runSimpleQuery(
    `
    DELETE FROM folders
    WHERE folderId = ?;
    `,
    [folderId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}
