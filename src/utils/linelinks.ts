import {LINE_LINKS_MANAGEMENT_API} from '../configs/api';
import {getToken} from './Token';
import axios from 'axios';
import RNFS from 'react-native-fs';
import {lineLinksPath} from '../configs/paths';
import { IDEAL_LINE_LINKS_NUMBER } from '../configs/constants';

export async function getNewLineLinks(): Promise<string[] | null> {
  try {
    const token = await getToken();
    if (token) {
      const response = await axios.post(LINE_LINKS_MANAGEMENT_API, {
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
export async function saveLineLinks(links:Array<string>) {
  const pathToFile = `${RNFS.DocumentDirectoryPath}/${lineLinksPath}`;
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
  const pathToFile = `${RNFS.DocumentDirectoryPath}/${lineLinksPath}`;
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
      const newLinks = await getNewLineLinks();
      if (newLinks === null) {
        await RNFS.writeFile(pathToFile, JSON.stringify(links), 'utf8');
        return poppedLink;
      }
      const finalLinks = [...newLinks, ...links];
      await RNFS.writeFile(pathToFile, JSON.stringify(finalLinks), 'utf8');
      return poppedLink;
    }
    const newLinks = await getNewLineLinks();
    if (newLinks === null) {
      return null;
    }
    const poppedLink: string = newLinks.pop();
    await RNFS.writeFile(pathToFile, JSON.stringify(newLinks), 'utf8');
    return poppedLink;
  } else {
    const newLinks = await getNewLineLinks();
    if (newLinks === null) {
      return null;
    }
    const poppedLink: string = newLinks.pop();
    await RNFS.writeFile(pathToFile, JSON.stringify(newLinks), 'utf8');
    return poppedLink;
  }
}