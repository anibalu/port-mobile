import * as dbCalls from './DBCalls/folders';
import {getNewMessageCount} from './connections';
import {defaultFolderId} from '@configs/constants';

/**
 * Save a new folder.
 * @param folder - folder info to save
 */
export async function addFolderEntry(folder: dbCalls.FolderInfo) {
  await dbCalls.addFolderEntry(folder);
}

/**
 * Fetch folder
 * @returns - folder
 */
export async function getFolder(
  folderId: string,
): Promise<dbCalls.FolderInfo | null> {
  return await dbCalls.getFolder(folderId);
}

/**
 * Fetch all folders
 * @returns - list of folders
 */
export async function getAllFolders(): Promise<dbCalls.FolderInfo[]> {
  return await dbCalls.getAllFolders();
}

/**
 * Get number of superports for a folder
 * @param folderId
 * @returns - count
 */
export async function getSuperportCountForFolder(folderId: string) {
  return await dbCalls.getSuperportCountForFolder(folderId);
}

/**
 * Get number of connections for a folder
 * @param folderId
 * @returns - count
 */
export async function getConnectionsCountForFolder(folderId: string) {
  return await dbCalls.getConnectionsCountForFolder(folderId);
}

/**
 * Get all folders with their respective unread count.
 * @returns - folders with their unread count
 */
export async function getAllFoldersWithUnreadCount(): Promise<
  FolderInfoWithUnread[]
> {
  const folders = await dbCalls.getAllFolders();
  const matches: FolderInfoWithUnread[] = folders.map(
    (folder: dbCalls.FolderInfo) => {
      const folderWithUnread: FolderInfoWithUnread = {
        ...folder,
        unread: 0,
        superportCount: 0,
        connectionsCount: 0,
      };
      return folderWithUnread;
    },
  );
  for (let index = 0; index < matches.length; index++) {
    matches[index].unread = await getNewMessageCount(matches[index].folderId);
    matches[index].superportCount = await getSuperportCountForFolder(
      matches[index].folderId,
    );
    matches[index].connectionsCount = await getConnectionsCountForFolder(
      matches[index].folderId,
    );
  }
  return matches;
}

/**
 * Update a folder name
 */
export async function updateFolderName(folderId: string, newName: string) {
  await dbCalls.updateFolderName(folderId, newName);
}

/**
 * Deletes a folder
 * @param folderId - folder to be deleted
 */
export async function deleteFolder(folderId: string) {
  if (folderId === defaultFolderId) {
    throw new Error('Default folder delete forbidden');
  }
  await dbCalls.deleteFolder(folderId);
}

export async function getFavouriteFoldersWithUnreadCount() {
  return await dbCalls.getFavoriteFoldersWithUnreadCount();
}
