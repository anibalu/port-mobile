import {
  defaultFolderInfo,
  defaultPermissions,
  defaultPermissionsId,
} from '@configs/constants';
import {addNewFolder} from '@utils/Storage/DBCalls/folders';
import {
  newPermissionEntry,
  updatePermissions,
} from '@utils/Storage/DBCalls/permissions';

/**
 * Set up default entries in Permissions and Folders
 * - creates default entry in permissions table
 * - creates default folder entry with default permission entry
 */
export default async function addDefaultEntries() {
  await newPermissionEntry(defaultPermissionsId);
  await updatePermissions(defaultPermissionsId, {...defaultPermissions});
  await addNewFolder({...defaultFolderInfo});
}
