import {defaultPermissions} from '@configs/constants';

import DirectChat from '@utils/DirectChats/DirectChat';

import {
  DirectPermissions,
  Permissions,
} from '../Storage/DBCalls/permissions/interfaces';

/**
 * Default permissions for direct chats
 * @returns - defaults
 */
export function getDefaultPermissions(): DirectPermissions {
  return {...defaultPermissions} as DirectPermissions;
}

export async function getChatPermissions(
  chatId: string,
): Promise<DirectPermissions> {
  const chat = new DirectChat(chatId);
  return await chat.getPermissions();
}

export async function updatePermissions(
  chatId: string,
  update: Permissions,
): Promise<void> {
  const chat = new DirectChat(chatId);
  await chat.updatePermissions(update);
}
