import {BUNDLE_MANAGEMENT_RESOURCE} from '@configs/api';
import axios from 'axios';

export async function getBundle(bundleId: string): Promise<string | null> {
  try {
    const response = await axios.get(
      `${BUNDLE_MANAGEMENT_RESOURCE}?bundleId=${encodeURIComponent(bundleId)}`,
    );
    return response.data.bundle;
  } catch (error) {
    console.error('Error getting bundle:', error);
    return null;
  }
}
