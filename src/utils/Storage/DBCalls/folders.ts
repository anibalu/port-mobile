import {runSimpleQuery, toNumber} from './dbCommon';

export interface FolderInfo {
  folderId: string;
  name: string;
  permissionsId: string;
}

/**
 * Save a new folder.
 * @param folder - folder info to save
 */
export async function addFolderEntry(folder: FolderInfo) {
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
 * Get number of superports for a folder
 * @param folderId
 * @returns - count
 */
export async function getSuperportCountForFolder(folderId: string) {
  let count = 0;
  await runSimpleQuery(
    `
      SELECT COUNT(*) as superportCount
      FROM superPorts 
      WHERE folderId = ?;
    `,
    [folderId],
    (tx, results) => {
      count = toNumber(results.rows.item(0).superportCount);
    },
  );
  return count;
}

/**
 * Get number of connections for a folder
 * @param folderId
 * @returns - count
 */
export async function getConnectionsCountForFolder(folderId: string) {
  let count = 0;
  await runSimpleQuery(
    `
      SELECT COUNT(*) as connectionsCount
      FROM connections 
      WHERE folderId = ?;
    `,
    [folderId],
    (tx, results) => {
      count = toNumber(results.rows.item(0).connectionsCount);
    },
  );
  return count;
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

export async function getFavouriteFolders() {
  let matches: FolderInfo[] = [];
  await runSimpleQuery(
    `
    SELECT *
      FROM
        folders JOIN permissions
        ON folders.permissionsId = permissions.permissionsId
      WHERE favourite = TRUE
    ;
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

export interface FolderInfoWithUnread extends FolderInfo {
  unread: number;
}
export async function getFavoriteFoldersWithUnreadCount(): Promise<
  FolderInfoWithUnread[]
> {
  const matches: FolderInfoWithUnread[] = [];
  await runSimpleQuery(
    `
    SELECT 
      favouriteFolders.folderId,
      favouriteFolders.name,
      favouriteFolders.permissionsId,
      count(nonFocusConnectionsWithUnreadCount.cid) as unread
    FROM 

    (SELECT folder.folderId, connection.routingId as cid
    FROM 
      connections connection
    LEFT JOIN
      lines
      ON connection.routingId = lines.lineId
    LEFT JOIN
      groups
      ON connection.routingId = groups.groupId
    LEFT JOIN
      folders folder
      ON connection.folderId = folder.folderId
    LEFT JOIN permissions ON COALESCE(lines.permissionsId, groups.permissionsId) = permissions.permissionsId
    WHERE permissions.focus = false AND connection.newMessageCount > 0) nonFocusConnectionsWithUnreadCount
    
    JOIN

    (SELECT 
      folders.name as name,
      folders.folderId as folderId,
      folderPermissions.permissionsId as permissionsId
    FROM 
      folders JOIN permissions folderPermissions
      ON folders.permissionsId = folderPermissions.permissionsId
    WHERE folderPermissions.favourite = TRUE
    ) favouriteFolders
    ON favouriteFolders.folderId = nonFocusConnectionsWithUnreadCount.folderId
    ;
    `,
    [],
    (_, results) => {
      const len = results.rows.length;
      for (let i = 0; i < len; i++) {
        matches.push(results.rows.item(i));
      }
    },
  );
  return matches;
}

/*
    `
    SELECT
      favouriteFolders.name as name
      favouriteFolders.folderId as folderId
      count(nonHomeChats.chatId) as unread

    FROM
      (SELECT
        folders.name as name,
        folders.folderId as folderId,
        folderPermissions.permissionsId as permissionsId
      FROM
        folders JOIN permissions folderPermissions
        ON folders.permissionsId = folderPermissions.permissionsId
      WHERE folderPermissions.favourite = TRUE
      ) favouriteFolders

      JOIN

      (SELECT
        connections.routingId as chatId
        connections.folderId as folderId
      FROM
        connections JOIN permissions
        ON connections.permissionsId = permissions.permissionsId
      WHERE permissions.focus = FALSE
      ) nonHomeChats
      ON folderId ;
    `,
    */
