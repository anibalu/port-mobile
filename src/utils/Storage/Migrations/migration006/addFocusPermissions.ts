import {defaultFolderId} from '@configs/constants';
import {
  getFolderPermissions,
  updateFolderPermissions,
} from '@utils/ChatFolders';

/**
 * This util sets the default(previously called Primary)
 * folder focus permission to true
 */
export async function setFocusPermissionForDefaultFolder() {
  const permissions = await getFolderPermissions(defaultFolderId);
  await updateFolderPermissions(defaultFolderId, {
    ...permissions,
    focus: true,
  });
}
