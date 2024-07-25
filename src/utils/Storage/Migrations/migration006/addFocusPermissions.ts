import {defaultFolderId} from '@configs/constants';
import {
  getFolderPermissions,
  updateFolderPermissions,
} from '@utils/ChatFolders';
import {updateFolderName} from '@utils/Storage/folders';
import {updateChatPermissionsInAFolder} from '@utils/Storage/permissions';

/**
 * This util sets the default(previously called Primary)
 * folder focus permission to true
 */
export async function setFocusPermissionForDefaultFolder() {
  await updateFolderName(defaultFolderId, 'Default');
  const permissions = await getFolderPermissions(defaultFolderId);
  await updateFolderPermissions(defaultFolderId, {
    ...permissions,
    focus: true,
  });
  await updateChatPermissionsInAFolder(defaultFolderId, {
    ...permissions,
    focus: true,
  });
}
