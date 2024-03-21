import {BUNDLE_MANAGEMENT_RESOURCE} from '@configs/api';
import axios from 'axios';

export async function getBundle(bundleId: string): Promise<string | null> {
  const response = await axios.get(
    `${BUNDLE_MANAGEMENT_RESOURCE}?bundleId=${encodeURIComponent(bundleId)}`,
  );
  return response.data.bundle;
}
