import {ChatType} from '@utils/Storage/DBCalls/connections';

import {
  DirectPermissions,
  GroupPermissions,
} from '../Storage/DBCalls/permissions/interfaces';

import * as direct from './direct';
import * as group from './group';

type ChatPermissions<T extends ChatType> = T extends ChatType.direct
  ? DirectPermissions
  : T extends ChatType.group
  ? GroupPermissions
  : never;

/**
 * Get Default permissions
 * @param chatType - direct or group
 * @returns - defaults
 */
export function getDefaultPermissions<T extends ChatType>(
  chatType: T,
): ChatPermissions<T> {
  if (chatType === ChatType.group) {
    return group.getDefaultPermissions() as ChatPermissions<T>;
  } else if (chatType === ChatType.direct) {
    return direct.getDefaultPermissions() as ChatPermissions<T>;
  }
  throw new Error('Invalid ChatType');
}

/**
 * Get chat permissions given a chatId
 * Please avoid using this. Use getChatPermissions available in DirectChat and Group classes.
 * @param chatId
 * @param chatType - group or direct
 * @returns - chat permissions
 */
export async function getChatPermissions<T extends ChatType>(
  chatId: string,
  chatType: T,
): Promise<ChatPermissions<T>> {
  if (chatType === ChatType.group) {
    return (await group.getChatPermissions(chatId)) as ChatPermissions<T>;
  } else if (chatType === ChatType.direct) {
    return (await direct.getChatPermissions(chatId)) as ChatPermissions<T>;
  }
  throw new Error('Invalid ChatType');
}
