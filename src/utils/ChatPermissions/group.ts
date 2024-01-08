import {defaultMasterDirectChatPermissions} from '@utils/ChatPermissionPresets';
import {
  GroupPermissions,
  Permissions,
  booleanKeysOfGroupPermissions,
  numberKeysOfGroupPermissions,
} from './interfaces';
import * as storage from '@utils/Storage/permissions';

const defaultGroupChatPermissions: GroupPermissions = {
  notifications: defaultMasterDirectChatPermissions.notifications,
  autoDownload: defaultMasterDirectChatPermissions.autoDownload,
  displayPicture: defaultMasterDirectChatPermissions.displayPicture,
  disappearingMessages: defaultMasterDirectChatPermissions.disappearingMessages,
};
export function getDefaultPermissions(): GroupPermissions {
  return {...defaultGroupChatPermissions};
}

function groupPermissionsMask(permissions: Permissions): GroupPermissions {
  const groupPermission: GroupPermissions = getDefaultPermissions();
  booleanKeysOfGroupPermissions.forEach(key => {
    groupPermission[key] = permissions[key] ? true : false;
  });
  numberKeysOfGroupPermissions.forEach(key => {
    if (permissions[key]) {
      groupPermission[key] = permissions[key] as number;
    }
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
