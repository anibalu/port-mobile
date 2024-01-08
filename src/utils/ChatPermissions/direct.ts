import {defaultMasterDirectChatPermissions} from '@utils/ChatPermissionPresets';
import {
  DirectPermissions,
  Permissions,
  booleanKeysOfDirectPermissions,
  numberKeysOfDirectPermissions,
} from './interfaces';
import * as storage from '@utils/Storage/permissions';

const defaultDirectChatPermissions: DirectPermissions = {
  notifications: defaultMasterDirectChatPermissions.notifications,
  autoDownload: defaultMasterDirectChatPermissions.autoDownload,
  displayPicture: defaultMasterDirectChatPermissions.displayPicture,
  contactSharing: defaultMasterDirectChatPermissions.contactSharing,
  disappearingMessages: defaultMasterDirectChatPermissions.disappearingMessages,
};
export function getDefaultPermissions(): DirectPermissions {
  return {...defaultDirectChatPermissions};
}

function directPermissionsMask(permissions: Permissions): DirectPermissions {
  const directPermissions: DirectPermissions = getDefaultPermissions();
  booleanKeysOfDirectPermissions.forEach(key => {
    directPermissions[key] = permissions[key] ? true : false;
  });
  numberKeysOfDirectPermissions.forEach(key => {
    if (permissions[key]) {
      directPermissions[key] = permissions[key] as number;
    }
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
