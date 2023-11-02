import RNFS from 'react-native-fs';
import {connectionLinksPath, connnectionLinksDir} from '../../../configs/paths';
import {connectionFsSync} from '../../Synchronization';

const DEFAULT_ENCODING = 'utf8';

/**
 * Creates a connection links directory if it doesn't exist and returns the path to it.
 * @returns {Promise<string>} The path to the connection links directory.
 */
async function makeConnectionLinksDir(): Promise<string> {
  const linksDirPath = RNFS.DocumentDirectoryPath + `${connnectionLinksDir}`;
  const folderExists = await RNFS.exists(linksDirPath);
  if (folderExists) {
    return linksDirPath;
  } else {
    await RNFS.mkdir(linksDirPath);
    return linksDirPath;
  }
}

/**
 * Retrieves the path to the direct connection links data file inside the connection links directory.
 * This function ensures the connection links directory exists.
 * @returns {Promise<string>} The path to the direct connection links data file.
 */
async function getDirectConnectionLinksPath(): Promise<string> {
  const linksDirPath = await makeConnectionLinksDir();
  return linksDirPath + connectionLinksPath;
}

/**
 * adds new direct connection links to file
 * @param {string[]} links - new direct connection links to add to file
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function writeNewDirectConnectionLinksRNFS(
  links: Array<string>,
  blocking: boolean = false,
) {
  const synced = async () => {
    const pathToFile = await getDirectConnectionLinksPath();
    const isFile = await RNFS.exists(pathToFile);
    if (isFile) {
      const linksDataJSON = await RNFS.readFile(pathToFile, DEFAULT_ENCODING);
      const linksData: Array<string> = JSON.parse(linksDataJSON);
      const newLinks: Array<string> = [...links, ...linksData];
      await RNFS.writeFile(
        pathToFile,
        JSON.stringify(newLinks),
        DEFAULT_ENCODING,
      );
    } else {
      await RNFS.writeFile(pathToFile, JSON.stringify(links), DEFAULT_ENCODING);
    }
  };
  if (blocking) {
    await connectionFsSync(synced);
  } else {
    await synced();
  }
}

/**
 * overwrites file with new direct connection links
 * @param {string[]} links - new direct connection links
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function writeDirectConnectionLinksRNFS(
  links: Array<string>,
  blocking: boolean = false,
) {
  const synced = async () => {
    const pathToFile = await getDirectConnectionLinksPath();
    await RNFS.writeFile(pathToFile, JSON.stringify(links), DEFAULT_ENCODING);
  };
  if (blocking) {
    await connectionFsSync(synced);
  } else {
    await synced();
  }
}

/**
 * returns unused direct connection links in file
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @returns {string[]} - unused direct connection links.
 */
export async function readDirectConnectionLinksRNFS(
  blocking: boolean = false,
): Promise<string[]> {
  const synced = async () => {
    const pathToFile = await getDirectConnectionLinksPath();
    const isFile = await RNFS.exists(pathToFile);
    if (isFile) {
      const linksDataJSON = await RNFS.readFile(pathToFile, DEFAULT_ENCODING);
      const linksData: Array<string> = JSON.parse(linksDataJSON);
      return linksData;
    } else {
      return [];
    }
  };
  if (blocking) {
    return await connectionFsSync(synced);
  } else {
    return await synced();
  }
}
