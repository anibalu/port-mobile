import {BundleMapEntry} from '@utils/Bundles/interfaces';
import * as rnfsStorage from '@utils/Storage/StorageRNFS/bundlesHandlers';
import {connectionFsSync} from '@utils/Synchronization';

export async function readBundleMap(blocking: boolean = true) {
  return await rnfsStorage.readBundleMap(blocking);
}

export async function writeBundleMap(
  bundleMap: BundleMapEntry[],
  blocking: boolean = true,
) {
  await rnfsStorage.writeBundleMap(bundleMap, blocking);
}

export async function getChatIdforBundleId(
  bundleId: string,
  blocking: boolean = true,
): Promise<string | null> {
  const synced = async () => {
    const bundleMap: BundleMapEntry[] = await readBundleMap(false);
    const index = bundleMap.findIndex(obj => obj.bundleId === bundleId);
    if (index !== -1) {
      const newArray = [
        ...bundleMap.slice(0, index),
        ...bundleMap.slice(index + 1),
      ];
      await writeBundleMap(newArray, false);
      return bundleMap[index].chatId;
    } else {
      return null;
    }
  };
  if (blocking) {
    return await connectionFsSync(synced);
  } else {
    return await synced();
  }
}

export async function addNewBundleMap(
  newMap: BundleMapEntry,
  blocking: boolean = true,
) {
  const synced = async () => {
    const bundleMap: BundleMapEntry[] = await readBundleMap(false);
    const newArray = [...bundleMap, newMap];
    await writeBundleMap(newArray, false);
  };
  if (blocking) {
    await connectionFsSync(synced);
  } else {
    await synced();
  }
}
