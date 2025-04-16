import {defaultFolderId} from '@configs/constants';

import {generateRandomHexId} from '@utils/IdGenerator';
import {
  getConnectionsByFolder,
  updateConnection,
} from '@utils/Storage/connections';
import {ConnectionEntry} from '@utils/Storage/DBCalls/connections';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import {
  Permissions,
  PermissionsStrict,
} from '@utils/Storage/DBCalls/permissions/interfaces';
import {getFolder} from '@utils/Storage/folders';
import * as folderStorage from '@utils/Storage/folders';
import * as permissionsStorage from '@utils/Storage/permissions';

/**
 * Add a new chat folder and returns folderId
 */
export async function addNewFolder(
  folderName: string,
  permissions: PermissionsStrict,
): Promise<FolderInfo> {
  //create permissions for the folder
  const permissionsId = generateRandomHexId();
  await permissionsStorage.addPermissionEntry({
    permissionsId: permissionsId,
    ...permissions,
  });
  //create folder
  const folderId = generateRandomHexId();
  const folder = {
    folderId: folderId,
    name: folderName,
    permissionsId: permissionsId,
  };
  await folderStorage.addFolderEntry(folder);
  return folder;
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
    if (!folder) {
      throw new Error('No such folder');
    }
    await permissionsStorage.updatePermissions(folder.permissionsId, update);
  } catch (error) {
    console.log('Error updating folder permissions', error);
  }
}

/**
 * Delete a chat folder safely by moving existing connections to default folder.
 */
export async function deleteFolder(
  folderId: string,
  destinationFolderId: string = defaultFolderId,
) {
  try {
    //move existing chats to new destination folder
    await moveConnectionsToNewFolderWithoutPermissionChange(
      await getConnectionsByFolder(folderId),
      destinationFolderId,
    );
    //delete folder
    await folderStorage.deleteFolder(folderId);
  } catch (error) {
    console.log('Error deleting folder', error);
  }
}

/**
 * Assign connections to a different folder
 */
export async function moveConnectionsToNewFolderWithoutPermissionChange(
  connections: ConnectionEntry[],
  folderId: string,
) {
  for (let index = 0; index < connections.length; index++) {
    //update chat folder Id
    await updateConnection({
      chatId: connections[index].chatId,
      folderId: folderId,
    });
  }
}

/**
 * Assign connection to a different folder
 */
export async function moveConnectionToNewFolderWithoutPermissionChange(
  chatId: string,
  folderId: string,
) {
  //update chat folder Id
  await updateConnection({
    chatId: chatId,
    folderId: folderId,
  });
}
