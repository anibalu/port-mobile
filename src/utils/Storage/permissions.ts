import {Permissions} from '@utils/ChatPermissions/interfaces';
import * as dbCalls from './DBCalls/permissions';

/**
 * Track a new chat's permissions
 * @param chatId a chatId to track permissions for
 */
export async function newPermissionEntry(chatId: string) {
  await dbCalls.newPermissionEntry(chatId);
}

/**
 * Get the saved permissions for a particular chatId
 * @param chatId a chatId to get associated permissions for
 * @returns the permissions for a given chat
 */
export async function getPermissions(chatId: string): Promise<Permissions> {
  return await dbCalls.getPermissions(chatId);
}

/**
 * Update the permissions for a chat
 * @param chatId the chatId for a chat to update permissions for
 * @param update the updates to the permissions
 */
export async function updatePermissions(chatId: string, update: Permissions) {
  await dbCalls.updatePermissions(chatId, update);
}

/**
 * Delete the permissions for a chat
 * @param chatId which chat to delete permissions for
 */
export async function clearPermissions(chatId: string) {
  await dbCalls.clearPermissions(chatId);
}
