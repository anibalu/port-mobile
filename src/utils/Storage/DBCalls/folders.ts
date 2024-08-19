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
