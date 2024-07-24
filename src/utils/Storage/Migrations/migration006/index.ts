import {setFocusPermissionForDefaultFolder} from './addFocusPermissions';
import permissionsFocus from './permissions';

export async function migration006() {
  await permissionsFocus();
  await setFocusPermissionForDefaultFolder();
}
