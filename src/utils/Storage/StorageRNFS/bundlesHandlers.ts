import RNFS from 'react-native-fs';
import {
  bundlesDir,
  generatedBundlesPath,
  readBundlesPath,
  generatedSuperportsPath,
} from '../../../configs/paths';
import {
  DirectConnectionBundle,
  GeneratedDirectConnectionBundle,
  GeneratedDirectSuperportConnectionBundle,
} from '../../Bundles/interfaces';
import {connectionFsSync} from '../../Synchronization';

const DEFAULT_ENCODING = 'utf8';

/**
 * Creates a bundles directory if it doesn't exist and returns the path to it.
 * @returns {Promise<string>} The path to the bundles directory.
 */
async function makeBundlesDirAsync(): Promise<string> {
  const bundlesDirPath = RNFS.DocumentDirectoryPath + `${bundlesDir}`;
  const folderExists = await RNFS.exists(bundlesDirPath);
  if (folderExists) {
    return bundlesDirPath;
  } else {
    await RNFS.mkdir(bundlesDirPath);
    return bundlesDirPath;
  }
}

/**
 * Create read bundles file inside bundle dir.
 * @returns {Promise<string>} The path to the read bundles file.
 */
async function initialiseReadBundlesFileAsync() {
  const pathToFile = (await makeBundlesDirAsync()) + `${readBundlesPath}`;
  if (await RNFS.exists(pathToFile)) {
    return pathToFile;
  }
  await RNFS.writeFile(pathToFile, JSON.stringify([]), DEFAULT_ENCODING);
  return pathToFile;
}

/**
 * Create generated bundles file inside bundle dir.
 * @returns {Promise<string>} The path to the generated bundles file.
 */
async function initialiseGeneratedBundlesFileAsync() {
  const pathToFile = (await makeBundlesDirAsync()) + `${generatedBundlesPath}`;
  if (await RNFS.exists(pathToFile)) {
    return pathToFile;
  }
  await RNFS.writeFile(pathToFile, JSON.stringify([]), DEFAULT_ENCODING);
  return pathToFile;
}

async function initialiseGeneratedSuperportBundlesFileAsync() {
  const pathToFile =
    (await makeBundlesDirAsync()) + `${generatedSuperportsPath}`;
  if (await RNFS.exists(pathToFile)) {
    return pathToFile;
  }
  await RNFS.writeFile(pathToFile, JSON.stringify([]), DEFAULT_ENCODING);
  return pathToFile;
}

/**
 * writes read bundles to file
 * @param {DirectConnectionBundle[]} bundles
 */
async function writeReadBundlesAsync(bundles: DirectConnectionBundle[]) {
  const pathToFile = await initialiseReadBundlesFileAsync();
  await RNFS.writeFile(pathToFile, JSON.stringify(bundles), DEFAULT_ENCODING);
}

/**
 * writes generated bundles to file
 * @param {GeneratedDirectConnectionBundle[]} bundles
 */
async function writeGeneratedBundlesAsync(
  bundles: GeneratedDirectConnectionBundle[],
) {
  const pathToFile = await initialiseGeneratedBundlesFileAsync();
  await RNFS.writeFile(pathToFile, JSON.stringify(bundles), DEFAULT_ENCODING);
}

async function writeGeneratedSuperportBundlesAsync(
  bundles: GeneratedDirectSuperportConnectionBundle[],
) {
  const pathToFile = await initialiseGeneratedSuperportBundlesFileAsync();
  await RNFS.writeFile(pathToFile, JSON.stringify(bundles), DEFAULT_ENCODING);
}

/**
 * Reads read bundles file and returns data
 * @returns {DirectConnectionBundle[]} - bundle data in file.
 */
async function readReadBundlesAsync() {
  const pathToFile = await initialiseReadBundlesFileAsync();
  const bundles: DirectConnectionBundle[] = JSON.parse(
    await RNFS.readFile(pathToFile, DEFAULT_ENCODING),
  );
  return bundles;
}

/**
 * Reads generated bundles file and returns data
 * @returns {DirectConnectionBundle[]} - bundle data in file.
 */
async function readGeneratedBundlesAsync() {
  const pathToFile = await initialiseGeneratedBundlesFileAsync();
  const bundles: GeneratedDirectConnectionBundle[] = JSON.parse(
    await RNFS.readFile(pathToFile, DEFAULT_ENCODING),
  );
  return bundles;
}

async function readGeneratedSuperportBundlesAsync() {
  const pathToFile = await initialiseGeneratedSuperportBundlesFileAsync();
  const bundles: GeneratedDirectSuperportConnectionBundle[] = JSON.parse(
    await RNFS.readFile(pathToFile, DEFAULT_ENCODING),
  );
  return bundles;
}

/**
 * saves read bundles to file
 * @param {DirectConnectionBundle[]} bundles
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveReadBundlesRNFS(
  bundles: DirectConnectionBundle[],
  blocking: boolean = false,
) {
  if (blocking) {
    const synced = async () => {
      await writeReadBundlesAsync(bundles);
    };
    await connectionFsSync(synced);
  } else {
    await writeReadBundlesAsync(bundles);
  }
}

/**
 * saves read bundles to file
 * @param {GeneratedDirectConnectionBundle[]} bundles
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveGeneratedBundlesRNFS(
  bundles: GeneratedDirectConnectionBundle[],
  blocking: boolean = false,
) {
  if (blocking) {
    const synced = async () => {
      await writeGeneratedBundlesAsync(bundles);
    };
    await connectionFsSync(synced);
  } else {
    await writeGeneratedBundlesAsync(bundles);
  }
}

export async function saveGeneratedSuperportBundlesRNFS(
  bundles: GeneratedDirectSuperportConnectionBundle[],
  blocking: boolean = false,
) {
  if (blocking) {
    const synced = async () => {
      await writeGeneratedSuperportBundlesAsync(bundles);
    };
    await connectionFsSync(synced);
  } else {
    await writeGeneratedSuperportBundlesAsync(bundles);
  }
}

/**
 * gets read bundles in storage
 * @@param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @returns {Promise<DirectConnectionBundle[]>}
 */
export async function getReadBundlesRNFS(
  blocking: boolean = false,
): Promise<DirectConnectionBundle[]> {
  if (blocking) {
    const synced = async () => {
      return await readReadBundlesAsync();
    };
    return await connectionFsSync(synced);
  } else {
    return await readReadBundlesAsync();
  }
}

/**
 * gets generated bundles in storage
 * @@param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @returns {Promise<GeneratedDirectConnectionBundle[]>}
 */
export async function getGeneratedBundlesRNFS(
  blocking: boolean = false,
): Promise<GeneratedDirectConnectionBundle[]> {
  if (blocking) {
    const synced = async () => {
      return await readGeneratedBundlesAsync();
    };
    return await connectionFsSync(synced);
  } else {
    return await readGeneratedBundlesAsync();
  }
}

export async function getGeneratedSuperportBundlesRNFS(
  blocking: boolean = false,
): Promise<GeneratedDirectSuperportConnectionBundle[]> {
  if (blocking) {
    const synced = async () => {
      return await readGeneratedSuperportBundlesAsync();
    };
    return await connectionFsSync(synced);
  } else {
    return await readGeneratedSuperportBundlesAsync();
  }
}
