import addGroupSuperports from './groupSuperPorts';
import renameGroupPortChannelToBundleId from './renameGroupPortChannelToBundleId';

export default async function migration015() {
  await addGroupSuperports();
  await renameGroupPortChannelToBundleId();
}
