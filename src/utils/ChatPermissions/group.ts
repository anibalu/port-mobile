import {defaultPermissions} from '@configs/constants';
import {GroupPermissions} from './interfaces';
import Group from '@utils/Groups/Group';

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
