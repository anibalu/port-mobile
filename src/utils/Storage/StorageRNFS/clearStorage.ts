/**
 * This file assists in clearing all files in RNFS
 */

import {isIOS} from '@components/ComponentUtils';
import {APP_GROUP_IDENTIFIER} from '@configs/constants';
import RNFS from 'react-native-fs';

/**
 * HAZMAT SUIT ON. Clear all files saved locally
 */
export default async function clearAllFiles() {
  try {
    await emptyDirectory(RNFS.CachesDirectoryPath);
  } catch {
    console.warn('Could not clear caches dir');
  }
  await emptyDirectory(RNFS.DocumentDirectoryPath);
  if (isIOS) {
    await emptyDirectory(await RNFS.pathForGroup(APP_GROUP_IDENTIFIER));
  }
}

/**
 * Clear out files in a directory while leaving the directory itself alone
 * @param path path to a directory to clear
 */
async function emptyDirectory(path: string) {
  console.log(path, await RNFS.stat(path));
  const files = await RNFS.readDir(path);
  for (let i = 0; i < files.length; i++) {
    const nodePath = files[i].path;
    // According to the documentation, unlink works recursively
    await RNFS.unlink(nodePath);
  }
}
