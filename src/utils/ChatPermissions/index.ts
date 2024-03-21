import {ChatPermissions, Permissions, PermissionsStrict} from './interfaces';
import * as group from './group';
import * as direct from './direct';
import {ChatType} from '@utils/Connections/interfaces';
import * as storage from '@utils/Storage/permissions';
import {
  disappearDuration,
  disappearOptions,
  disappearOptionsTypes,
} from '@utils/Time/interfaces';
import {getFolderPermissions} from '@utils/Storage/folders';
import {generateRandomHexId} from '@utils/IdGenerator';
import {isGroupChat} from '@utils/Connections';
import Group from '@utils/Groups/Group';
import DirectChat from '@utils/DirectChats/DirectChat';

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
  await storage.newPermissionEntry(permissionsId);
  await storage.updatePermissions(permissionsId, permissions);
  return permissionsId;
}

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

/**
 * Update a chat's permissions
 * @param chatId
 * @param update
 */
export async function updateChatPermissions(
  chatId: string,
  update: Permissions,
) {
  const isGroup = await isGroupChat(chatId);
  if (isGroup) {
    const group = new Group(chatId);
    await group.updatePermissions(update);
  } else {
    const chat = new DirectChat(chatId);
    await chat.updatePermissions(update);
  }
}

export function getLabelByTimeDiff(
  duration?: number | null,
): disappearOptionsTypes {
  if (!duration) {
    return 'Off';
  }
  for (let index = 0; index < disappearOptions.length; index++) {
    const label = disappearOptions[index];
    const diff: number = disappearDuration[label];
    if (diff === duration) {
      return label as disappearOptionsTypes;
    }
  }

  return 'Off'; // If no matching label is found
}
