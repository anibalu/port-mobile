import {
  DirectPermissions,
  GroupPermissions,
  ChatPermissions,
  Permissions,
  MasterPermissions,
} from './interfaces';
import * as group from './group';
import * as direct from './direct';
import {ChatType} from '@utils/Connections/interfaces';
import * as storage from '@utils/Storage/permissions';
import {getPermissionPresetPermissions} from '@utils/ChatPermissionPresets';

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

export async function createChatPermissions<T extends ChatType>(
  chatId: string,
  chatType: T,
  presetId: string | null = null,
  permissions: ChatPermissions<T> = getDefaultPermissions(chatType),
) {
  const newPermissions: MasterPermissions =
    await getPermissionPresetPermissions(presetId);
  if (chatType === ChatType.group) {
    presetId
      ? await group.createChatPermissions(
          chatId,
          newPermissions as GroupPermissions,
        )
      : await group.createChatPermissions(
          chatId,
          permissions as GroupPermissions,
        );
  } else if (chatType === ChatType.direct) {
    presetId
      ? await direct.createChatPermissions(
          chatId,
          newPermissions as DirectPermissions,
        )
      : await direct.createChatPermissions(
          chatId,
          permissions as DirectPermissions,
        );
  }
}

export async function updateChatPermissions(
  chatId: string,
  update: Permissions,
) {
  await storage.updatePermissions(chatId, update);
}
