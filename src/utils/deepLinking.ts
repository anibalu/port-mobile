import axios from 'axios';
import {BUNDLE_MANAGEMENT_RESOURCE} from '../configs/api';
import {getTokenAsync} from './Token';
import {bundleReadHandshake} from '../actions/BundleReadHandshake';
import {bundle} from './bundles';
import {connectionFsSync} from './syncronization';

interface urlObject {
  url: string | null;
}
export async function handleDeepLink(urlObj: urlObject) {
  const synced = async () => {
    const url = urlObj.url;
    if (url) {
      console.log(url);
      let regex = /[?&]([^=#]+)=([^&#]*)/g,
        params = {},
        match;
      while ((match = regex.exec(url))) {
        params[match[1]] = match[2];
      }
      const bundleId = params.bundleId;
      console.log(bundleId);
      const bundle = await getBundle(bundleId);
      return bundle;
    }
    return null;
  };
  const bundle = await connectionFsSync(synced);
  if (bundle) {
    await bundleReadHandshake(JSON.parse(bundle));
  }
}

export async function getBundle(bundleId: string): Promise<bundle | null> {
  try {
    const token = await getTokenAsync();
    if (token) {
      const response = await axios.get(
        BUNDLE_MANAGEMENT_RESOURCE + '?bundleId=' + bundleId,
      );
      return response.data.bundle;
    }
    throw new Error('TokenError');
  } catch (error) {
    console.error('Error getting bundle:', error);
    return null;
  }
}
