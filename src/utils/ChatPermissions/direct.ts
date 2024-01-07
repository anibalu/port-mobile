import {defaultMasterDirectChatPermissions} from '@utils/ChatPermissionPresets';
import {
  DirectPermissions,
  Permissions,
  keysOfDirectPermissions,
} from './interfaces';
import * as storage from '@utils/Storage/permissions';

const defaultDirectChatPermissions: DirectPermissions = {
  notifications: defaultMasterDirectChatPermissions.notifications,
  autoDownload: defaultMasterDirectChatPermissions.autoDownload,
  displayPicture: defaultMasterDirectChatPermissions.displayPicture,
  contactSharing: defaultMasterDirectChatPermissions.contactSharing,
};
export function getDefaultPermissions(): DirectPermissions {
  return {...defaultDirectChatPermissions};
}

function directPermissionsMask(permissions: Permissions): DirectPermissions {
  const directPermissions: DirectPermissions = getDefaultPermissions();
  keysOfDirectPermissions.forEach(key => {
    directPermissions[key] = permissions[key] ? true : false;
  });
  return directPermissions;
}

export async function getChatPermissions(
  chatId: string,
): Promise<DirectPermissions> {
  const permissions: Permissions = await storage.getPermissions(chatId);
  if (JSON.stringify(permissions) === '{}') {
    return getDefaultPermissions();
  }
  return directPermissionsMask(permissions);
}

export async function createChatPermissions(
  chatId: string,
  permissions: DirectPermissions,
) {
  await storage.newPermissionEntry(chatId);
  await storage.updatePermissions(chatId, permissions);
}
