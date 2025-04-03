import addFolderColorTag from './addFolderColorTag';
import {addPermissionIdToSuperPorts} from './addPermissionsIdToSuperPorts';
import {
  renamePortChannelToBundleId,
  renameSuperPortChannelToBundleId,
} from './renameChannelToBundleId';

export default async function migration013() {
  await addFolderColorTag();
  await renamePortChannelToBundleId();
  await renameSuperPortChannelToBundleId();
  await addPermissionIdToSuperPorts();
}
