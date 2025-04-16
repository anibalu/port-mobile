import axios from 'axios';

import {
  BUNDLE_MANAGEMENT_RESOURCE,
  GROUP_LINKS_MANAGEMENT_RESOURCE,
} from '@configs/api';

import {getToken} from '@utils/ServerAuth';

/**
 * upload a bundle string and get the associated bundle Id of the upload
 * @param bundleString - string being uploaded.
 * @param persistent - whether bundle can be used multiple times. default is false
 * @returns - bundle Id
 */
export async function getBundleId(
  bundleString: string,
  persistent: boolean = false,
): Promise<string> {
  const token = await getToken();
  const response = await axios.post(
    BUNDLE_MANAGEMENT_RESOURCE,
    {
      bundle: bundleString,
      persistent: persistent,
    },
    {headers: {Authorization: `${token}`}},
  );
  if (response.data.bundleId) {
    const bundleId: string = response.data.bundleId;
    return bundleId;
  }
  throw new Error('APIError');
}

/**
 * Fetches new unused group ports for a group
 * @param groupId - Id of the group
 * @returns - array of Port Ids
 */
export async function getNewGroupPorts(groupId: string): Promise<string[]> {
  const token = await getToken();
  //add group links management resource
  const response = await axios.post(
    GROUP_LINKS_MANAGEMENT_RESOURCE,
    {
      groupId: groupId,
    },
    {headers: {Authorization: `${token}`}},
  );
  if (response.data) {
    const connectionLinks: string[] = response.data;
    return connectionLinks;
  }
  throw new Error('APIError');
}

