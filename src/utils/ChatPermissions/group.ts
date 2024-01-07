import {defaultMasterDirectChatPermissions} from '@utils/ChatPermissionPresets';
import {
  GroupPermissions,
  Permissions,
  keysOfGroupPermissions,
} from './interfaces';
import * as storage from '@utils/Storage/permissions';

const defaultGroupChatPermissions: GroupPermissions = {
  notifications: defaultMasterDirectChatPermissions.notifications,
  autoDownload: defaultMasterDirectChatPermissions.autoDownload,
  displayPicture: defaultMasterDirectChatPermissions.displayPicture,
};
export function getDefaultPermissions(): GroupPermissions {
  return {...defaultGroupChatPermissions};
}

function groupPermissionsMask(permissions: Permissions): GroupPermissions {
  const groupPermission: GroupPermissions = getDefaultPermissions();
  keysOfGroupPermissions.forEach(key => {
    groupPermission[key] = permissions[key] ? true : false;
  });
  return groupPermission;
}

export async function getChatPermissions(
  chatId: string,
): Promise<GroupPermissions> {
  const permissions: Permissions = await storage.getPermissions(chatId);
  if (JSON.stringify(permissions) === '{}') {
    return getDefaultPermissions();
  }
  return groupPermissionsMask(permissions);
}

export async function createChatPermissions(
  chatId: string,
  permissions: GroupPermissions,
) {
  await storage.newPermissionEntry(chatId);
  await storage.updatePermissions(chatId, permissions);
}
