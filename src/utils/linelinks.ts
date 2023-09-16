import {LINE_LINKS_MANAGEMENT_RESOURCE} from '../configs/api';
import {getTokenAsync} from './Token';
import axios from 'axios';
import RNFS from 'react-native-fs';
import {lineLinksPath, linksDir} from '../configs/paths';
import {IDEAL_LINE_LINKS_NUMBER} from '../configs/constants';
import {connectionFsSync} from './syncronization';

/**
 * Creates a links directory if it doesn't exist and returns the path to it.
 * @returns {Promise<string>} The path to the links directory.
 */
async function makeLinksDir(): Promise<string> {
  const linksDirPath = RNFS.DocumentDirectoryPath + `${linksDir}`;
  const folderExists = await RNFS.exists(linksDirPath);
  if (folderExists) {
    return linksDirPath;
  } else {
    await RNFS.mkdir(linksDirPath);
    return linksDirPath;
  }
}
/**
 * Retrieves the path to the line connection links data file inside the links directory.
 * This function ensures the links directory exists.
 * @returns {Promise<string>} The path to the line links data file.
 */
async function getLineLinksPath(): Promise<string> {
  const linksDirPath = await makeLinksDir();
  return linksDirPath + lineLinksPath;
}

export async function getNewLineLinksAsync(): Promise<string[] | null> {
  try {
    const token = await getTokenAsync();
    if (token) {
      const response = await axios.post(LINE_LINKS_MANAGEMENT_RESOURCE, {
        token: token,
      });
      const lineLinks: string[] = response.data;
      return lineLinks;
    }
    throw new Error('TokenError');
  } catch (error) {
    console.error('Error getting line links:', error);
    return null;
  }
}

//saves line links to file
export async function saveLineLinksAsync(links: Array<string>) {
  const pathToFile = await getLineLinksPath();
  const isFile = await RNFS.exists(pathToFile);
  if (isFile) {
    const linksDataJSON = await RNFS.readFile(pathToFile, 'utf8');
    const linksData: Array<string> = JSON.parse(linksDataJSON);
    const newLinks: Array<string> = [...links, ...linksData];
    await RNFS.writeFile(pathToFile, JSON.stringify(newLinks), 'utf8');
  } else {
    await RNFS.writeFile(pathToFile, JSON.stringify(links), 'utf8');
  }
}

//gets an unused line link.
export async function getLineLink() {
  const synced = async () => {
    const pathToFile = await getLineLinksPath();
    const isFile = await RNFS.exists(pathToFile);
    if (isFile) {
      const linksDataJSON = await RNFS.readFile(pathToFile, 'utf8');
      const links: Array<string> = JSON.parse(linksDataJSON);
      if (links.length > IDEAL_LINE_LINKS_NUMBER) {
        const poppedLink: string = links.pop();
        await RNFS.writeFile(pathToFile, JSON.stringify(links), 'utf8');
        return poppedLink;
      }
      if (links.length >= 1) {
        const poppedLink: string = links.pop();
        const newLinks = await getNewLineLinksAsync();
        if (newLinks === null) {
          await RNFS.writeFile(pathToFile, JSON.stringify(links), 'utf8');
          return poppedLink;
        }
        const finalLinks = [...newLinks, ...links];
        await RNFS.writeFile(pathToFile, JSON.stringify(finalLinks), 'utf8');
        return poppedLink;
      }
      const newLinks = await getNewLineLinksAsync();
      if (newLinks === null) {
        return null;
      }
      const poppedLink: string = newLinks.pop();
      await RNFS.writeFile(pathToFile, JSON.stringify(newLinks), 'utf8');
      return poppedLink;
    } else {
      const newLinks = await getNewLineLinksAsync();
      if (newLinks === null) {
        return null;
      }
      const poppedLink: string = newLinks.pop();
      await RNFS.writeFile(pathToFile, JSON.stringify(newLinks), 'utf8');
      return poppedLink;
    }
  };
  return await connectionFsSync(synced);
}
