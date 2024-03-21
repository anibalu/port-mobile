import {defaultPermissions} from '@configs/constants';
import {DirectPermissions} from './interfaces';
import DirectChat from '@utils/DirectChats/DirectChat';

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
