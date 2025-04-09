import {defaultPermissions} from '@configs/constants';

import Group from '@utils/Groups/Group';

import {
  GroupPermissions,
  Permissions,
} from '../Storage/DBCalls/permissions/interfaces';

/**
 * Default permissions for group chats
 * @returns - defaults
 */
export function getDefaultPermissions(): GroupPermissions {
  return {...defaultPermissions} as GroupPermissions;
}

export async function getChatPermissions(
  chatId: string,
): Promise<GroupPermissions> {
  const group = new Group(chatId);
  return await group.getPermissions();
}

export async function updatePermissions(
  chatId: string,
  update: Permissions,
): Promise<void> {
  const chat = new Group(chatId);
  await chat.updatePermissions(update);
}
