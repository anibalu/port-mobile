import {LINE_LINKS_MANAGEMENT_RESOURCE} from '../../configs/api';
import axios from 'axios';
import {IDEAL_LINE_LINKS_NUMBER} from '../../configs/constants';
import {connectionFsSync} from '../Synchronization';
import {getToken} from '../ServerAuth';
import {
  getUnusedDirectConnectionLinks,
  saveDirectConnectionLinks,
  saveNewDirectConnectionLinks,
} from '../Storage/connectionLinks';

/**
 * asks the server for new direct connection links.
 * @returns {Promise<string[] | null>} - new direct connection links or null
 */
export async function getNewDirectConnectionLinks(
  blocking: boolean = false,
): Promise<string[] | null> {
  try {
    const token = await getToken(blocking);
    const response = await axios.post(LINE_LINKS_MANAGEMENT_RESOURCE, null, {
      headers: {Authorization: `${token}`},
    });
    const connectionLinks: string[] = response.data;
    return connectionLinks;
  } catch (error) {
    console.log('Error getting direct connection links:', error);
    return null;
  }
}

/**
 * asks the server for new direct connection links initially.
 * @returns {Promise<boolean>} - based on whether the request is successful.
 */
export async function getInitialDirectConnectionLinks(): Promise<boolean> {
  const newLinks = await getNewDirectConnectionLinks(true);
  if (newLinks !== null) {
    await saveNewDirectConnectionLinks(newLinks, true);
    return true;
  }
  return false;
}

/**
 * Tries to get a usable direct connection link. returns null if it fails.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = true.
 * @returns {Promise<string | null>} - new usable direct connection link or null
 */
export async function getDirectConnectionLink(
  blocking: boolean = true,
): Promise<string | null> {
  const synced = async () => {
    //get unused links
    const links = await getUnusedDirectConnectionLinks(false);
    //if there are a sufficient number of unused links
    if (links.length > IDEAL_LINE_LINKS_NUMBER) {
      const poppedLink = links.pop();
      await saveDirectConnectionLinks(links, false);
      if (poppedLink !== undefined) {
        return poppedLink;
      }
    }
    //if we are almost running out of unused links
    if (links.length >= 1) {
      const poppedLink = links.pop();
      const newLinks = await getNewDirectConnectionLinks();
      if (newLinks === null) {
        await saveDirectConnectionLinks(links, false);
        if (poppedLink !== undefined) {
          return poppedLink;
        }
      } else {
        await saveNewDirectConnectionLinks(newLinks, false);
        if (poppedLink !== undefined) {
          return poppedLink;
        }
      }
    }
    //if we have run out of unused links
    const newLinks = await getNewDirectConnectionLinks();
    if (newLinks !== null) {
      const poppedLink = newLinks.pop();
      await saveNewDirectConnectionLinks(newLinks, false);
      if (poppedLink !== undefined) {
        return poppedLink;
      }
    }
    return null;
  };
  if (blocking) {
    return await connectionFsSync(synced);
  } else {
    return await synced();
  }
}
