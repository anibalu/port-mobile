import {FolderInfo, FolderInfoWithUnread} from '@utils/ChatFolders/interfaces';
import {PermissionsStrict} from '@utils/ChatPermissions/interfaces';
import * as dbCalls from './DBCalls/folders';

/**
 * Save a new folder.
 * @param folder - folder info to save
 */
export async function addNewFolder(folder: FolderInfo) {
  await dbCalls.addNewFolder(folder);
}

/**
 * Fetches the permissions for a folder
 * @param folderId
 * @returns permissions for the folder
 */
export async function getFolderPermissions(
  folderId: string,
): Promise<PermissionsStrict> {
  return await dbCalls.getFolderPermissions(folderId);
}

/**
 * Fetch folder
 * @returns - folder
 */
export async function getFolder(folderId: string): Promise<FolderInfo | null> {
  return await dbCalls.getFolder(folderId);
}

/**
 * Fetch all folders
 * @returns - list of folders
 */
export async function getAllFolders(): Promise<FolderInfo[]> {
  return await dbCalls.getAllFolders();
}

export async function getAllFoldersWithUnreadCount(): Promise<
  FolderInfoWithUnread[]
> {
  return await dbCalls.getAllFoldersWithUnreadCount();
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
  await dbCalls.deleteFolder(folderId);
}
