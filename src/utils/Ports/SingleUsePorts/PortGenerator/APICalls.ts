import {LINE_LINKS_MANAGEMENT_RESOURCE} from '@configs/api';
import {getToken} from '@utils/ServerAuth';
import axios from 'axios';

/**
 * fetches new unused Ports
 * @returns - list of port Ids
 */
export async function getNewPorts(): Promise<string[]> {
  const token = await getToken();
  const response = await axios.post(LINE_LINKS_MANAGEMENT_RESOURCE, null, {
    headers: {Authorization: `${token}`},
  });
  const portIds: string[] = response.data;
  return portIds;
}
