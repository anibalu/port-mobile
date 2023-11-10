/**
 * file to manage group connection links
 */

import axios from 'axios';
import {IDEAL_LINE_LINKS_NUMBER} from '../../configs/constants';
import {connectionFsSync} from '../Synchronization';
import {getToken} from '../ServerAuth';
import {
  getUnusedGroupConnectionLinks,
  saveGroupConnectionLinks,
  saveNewGroupConnectionLinks,
} from '../Storage/connectionLinks';
import {GROUP_LINKS_MANAGEMENT_RESOURCE} from '../../configs/api';

/**
 * asks the server for new group connection links.
 * @param {string} groupId - groupId of group.
 * @returns {Promise<string[] | null>} - new group connection links or null
 */
export async function getNewGroupConnectionLinks(
  groupId: string,
  blocking: boolean = false,
): Promise<string[] | null> {
  try {
    const token = await getToken(blocking);
    //add group links management resource
    const response = await axios.post(GROUP_LINKS_MANAGEMENT_RESOURCE, {
      token: token,
      groupId: groupId,
    });
    const connectionLinks: string[] = response.data;
    return connectionLinks;
  } catch (error) {
    console.log('Error getting direct connection links:', error);
    return null;
  }
}

/**
 * asks the server for new group connection links initially.
 * @param {string} groupId - groupId of group.
 * @returns {Promise<boolean>} - based on whether the request is successful.
 */
export async function getInitialGroupConnectionLinks(
  groupId: string,
): Promise<boolean> {
  const newLinks = await getNewGroupConnectionLinks(groupId, true);
  if (newLinks !== null) {
    await saveNewGroupConnectionLinks(groupId, newLinks, true);
    return true;
  }
  return false;
}

/**
 * Tries to get a usable direct connection link. returns null if it fails.
 * @param {string} groupId - groupId of group.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = true.
 * @returns {Promise<string | null>} - new usable direct connection link or null
 */
export async function getGroupConnectionLink(
  groupId: string,
  blocking: boolean = true,
): Promise<string | null> {
  const synced = async () => {
    //get unused links
    const links = await getUnusedGroupConnectionLinks(groupId, false);
    //if there are a sufficient number of unused links
    if (links.length > IDEAL_LINE_LINKS_NUMBER) {
      const poppedLink = links.pop();
      await saveGroupConnectionLinks(groupId, links, false);
      if (poppedLink !== undefined) {
        return poppedLink;
      }
    }
    //if we are almost running out of unused links
    if (links.length >= 1) {
      const poppedLink = links.pop();
      const newLinks = await getNewGroupConnectionLinks(groupId, false);
      if (newLinks === null) {
        await saveGroupConnectionLinks(groupId, links, false);
        if (poppedLink !== undefined) {
          return poppedLink;
        }
      } else {
        await saveNewGroupConnectionLinks(groupId, newLinks, false);
        if (poppedLink !== undefined) {
          return poppedLink;
        }
      }
    }
    //if we have run out of unused links
    const newLinks = await getNewGroupConnectionLinks(groupId, false);
    if (newLinks !== null) {
      const poppedLink = newLinks.pop();
      await saveNewGroupConnectionLinks(groupId, newLinks, false);
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
