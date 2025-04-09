import {generateRandomHexId} from '@utils/IdGenerator';
import {
  Permissions,
  PermissionsEntry,
  PermissionsStrict,
} from '@utils/Storage/DBCalls/permissions/interfaces';

import {getConnectionsByFolder} from './connections';
import * as dbCalls from './DBCalls/permissions';
import {getFolder} from './folders';

/**
 * Adds a set of permissions to storage
 * @param data - permissions
 */
export async function addPermissionEntry(data: PermissionsEntry) {
  await dbCalls.addPermissionEntry(data);
}

export async function getAllPermissions(): Promise<PermissionsEntry[]> {
  return await dbCalls.getAllPermissions();
}

/**
 * Get the saved permissions for a particular chatId
 * @param chatId a chatId to get associated permissions for
 * @returns the permissions for a given chat
 */
export async function getPermissions(
  permissionsId?: string | null,
): Promise<PermissionsStrict> {
  return await dbCalls.getPermissions(permissionsId);
}

/**
 * Update the permissions for a chat
 * @param chatId the chatId for a chat to update permissions for
 * @param update the updates to the permissions
 */
export async function updatePermissions(
  permissionsId: string,
  update: Permissions,
) {
  await dbCalls.updatePermissions(permissionsId, update);
}

/**
 * Delete the permissions for a chat
 * @param chatId which chat to delete permissions for
 */
export async function clearPermissions(permissionsId: string) {
  await dbCalls.clearPermissions(permissionsId);
}

export async function updateChatPermissionsInAFolder(
  folderId: string,
  permissions: Permissions,
) {
  // TODO: write db call for this and remove this layer
  const connections = await getConnectionsByFolder(folderId);
  for (let index = 0; index < connections.length; index++) {
    //update chat permissions to folder permissions
    await updatePermissions(connections[index].permissionsId, permissions);
  }
}

/**
 * Fetches the permissions for a folder
 * @param folderId
 * @returns permissions for the folder
 */
export async function getFolderPermissions(
  folderId: string,
): Promise<PermissionsStrict> {
  const folder = await getFolder(folderId);
  return await dbCalls.getPermissions(folder?.permissionsId);
}

/**
 * Creates permissions based on folder permissions and returns permissionsId.
 * @param folderId
 * @returns - newly created permissionsId
 */
export async function createChatPermissionsFromFolderId(
  folderId: string,
): Promise<string> {
  const permissions: PermissionsStrict = await getFolderPermissions(folderId);
  const permissionsId = generateRandomHexId();
  await addPermissionEntry({permissionsId: permissionsId, ...permissions});
  return permissionsId;
}
