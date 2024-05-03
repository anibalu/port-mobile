import {BUNDLE_MANAGEMENT_RESOURCE} from '@configs/api';
import {getToken} from '@utils/ServerAuth';
import axios from 'axios';

export async function getBundle(bundleId: string): Promise<string | null> {
  const token = await getToken();
  const response = await axios.get(
    `${BUNDLE_MANAGEMENT_RESOURCE}?bundleId=${encodeURIComponent(bundleId)}`,
    {headers: {Authorization: `${token}`}},
  );
  return response.data.bundle;
}
