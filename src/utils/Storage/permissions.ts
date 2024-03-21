import {
  Permissions,
  PermissionsStrict,
} from '@utils/ChatPermissions/interfaces';
import * as dbCalls from './DBCalls/permissions';

/**
 * Track a new chat's permissions
 * @param chatId a chatId to track permissions for
 */
export async function newPermissionEntry(permissionsId: string) {
  await dbCalls.newPermissionEntry(permissionsId);
}

/**
 * Get the saved permissions for a particular chatId
 * @param chatId a chatId to get associated permissions for
 * @returns the permissions for a given chat
 */
export async function getPermissions(
  permissionsId?: string,
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
