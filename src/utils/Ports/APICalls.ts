import {
  BUNDLE_MANAGEMENT_RESOURCE,
  GROUP_LINKS_MANAGEMENT_RESOURCE,
  LINE_LINKS_MANAGEMENT_RESOURCE,
  LINE_SUPERPORT_MANAGEMENT_RESOURCE,
} from '@configs/api';
import {getToken} from '@utils/ServerAuth';
import axios from 'axios';

export async function getNewPorts(): Promise<string[]> {
  const token = await getToken();
  const response = await axios.post(LINE_LINKS_MANAGEMENT_RESOURCE, null, {
    headers: {Authorization: `${token}`},
  });
  const portIds: string[] = response.data;
  return portIds;
}

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

export async function getNewDirectSuperport(): Promise<string> {
  const token = await getToken();
  const response = await axios.post(LINE_SUPERPORT_MANAGEMENT_RESOURCE, null, {
    headers: {Authorization: `${token}`},
  });
  if (response.data.NewSuperPort) {
    const superport = response.data.NewSuperPort;
    return superport;
  }
  throw new Error('APIError');
}
