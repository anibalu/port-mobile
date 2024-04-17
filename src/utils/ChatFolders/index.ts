import * as folderStorage from '@utils/Storage/folders';
import * as permissionsStorage from '@utils/Storage/permissions';
import {
  Permissions,
  PermissionsStrict,
} from '@utils/ChatPermissions/interfaces';
import {generateRandomHexId} from '@utils/IdGenerator';
import {FolderInfo} from './interfaces';
import {
  getConnectionsByFolder,
  moveConnectionsToNewFolder,
} from '@utils/Connections';
import {defaultFolderId} from '@configs/constants';
import {updateChatPermissions} from '@utils/ChatPermissions';

/**
 * Get all chat folders
 */
export async function getAllFolders() {
  return await folderStorage.getAllFolders();
}

/**
 * Get all chat folders with unread count
 */
export async function getAllFoldersWithUnreadCount() {
  return await folderStorage.getAllFoldersWithUnreadCount();
}

/**
 * Get a folder's info
 * @param folderId
 * @returns - folder info of folder
 */
export async function getFolder(folderId: string): Promise<FolderInfo> {
  const folder = await folderStorage.getFolder(folderId);
  if (!folder) {
    throw new Error('No such folder');
  }
  return folder as FolderInfo;
}

/**
 * Add a new chat folder and returns folderId
 */
export async function addNewFolder(
  folderName: string,
  permissions: PermissionsStrict,
): Promise<FolderInfo> {
  //create permissions for the folder
  const permissionsId = generateRandomHexId();
  await permissionsStorage.newPermissionEntry(permissionsId);
  await permissionsStorage.updatePermissions(permissionsId, permissions);
  //create folder
  const folderId = generateRandomHexId();
  const folder = {
    folderId: folderId,
    name: folderName,
    permissionsId: permissionsId,
  };
  await folderStorage.addNewFolder(folder);
  return folder;
}

/**
 * USE FOR RECOVERY ONLY
 * Add a folder entry to the database
 * @param folderData The folder entry to add
 */
export async function addFolderEntry(folderData: FolderInfo) {
  await folderStorage.addNewFolder(folderData);
}

/**
 * Get a folder's permissions
 */
export async function getFolderPermissions(folderId: string) {
  const permissions = folderStorage.getFolderPermissions(folderId);
  return permissions;
}

/**
 * Edit permissions associated with a chat folder
 */
export async function updateFolderPermissions(
  folderId: string,
  update: Permissions,
) {
  try {
    const folder = await getFolder(folderId);
    await permissionsStorage.updatePermissions(folder.permissionsId, update);
  } catch (error) {
    console.log('Error updating folder permissions', error);
  }
}

/**
 * Edit a folder's name
 */
export async function editFolderName(folderId: string, newName: string) {
  try {
    await folderStorage.updateFolderName(folderId, newName);
  } catch (error) {
    console.log('Error updating folder name', error);
  }
}

/**
 * Apply folder permissions to all chats in folder
 */
export async function applyFolderPermissions(folderId: string) {
  //get folder permissions
  const folderPermissions = await getFolderPermissions(folderId);
  const connections = await getConnectionsByFolder(folderId);
  for (let index = 0; index < connections.length; index++) {
    //update chat permissions to folder permissions
    await updateChatPermissions(connections[index].chatId, folderPermissions);
  }
}

/**
 * Delete a chat folder
 */
export async function deleteFolder(
  folderId: string,
  destinationFolderId: string = defaultFolderId,
) {
  try {
    //move existing chats to new destination folder
    await moveConnectionsToNewFolder(
      await getConnectionsByFolder(folderId),
      destinationFolderId,
    );
    //delete folder
    await folderStorage.deleteFolder(folderId);
  } catch (error) {
    console.log('Error deleting folder', error);
  }
}
