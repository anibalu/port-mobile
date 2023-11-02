import axios from 'axios';
import {BUNDLE_MANAGEMENT_RESOURCE} from '../../configs/api';
import {connectionFsSync} from '../Synchronization';
import {handshakeActionsB1} from '.';
import {getToken} from '../ServerAuth';
import {DirectConnectionBundle} from '../Bundles/interfaces';

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
      const bundle = await getBundle(bundleId);
      return bundle;
    }
    return null;
  };
  const bundle = await connectionFsSync(synced);
  if (bundle) {
    await handshakeActionsB1(bundle);
  }
}

export async function getBundle(
  bundleId: string,
): Promise<DirectConnectionBundle | null> {
  try {
    const response = await axios.get(
      BUNDLE_MANAGEMENT_RESOURCE + '?bundleId=' + bundleId,
    );
    return response.data.bundle;
  } catch (error) {
    console.error('Error getting bundle:', error);
    return null;
  }
}

export async function convertBundleToLink(bundleData: string) {
  const bundleId = await postBundle(bundleData);
  if (bundleId) {
    const url = 'https://it.numberless.tech/connect?bundleId=' + bundleId;
    return url;
  }
  return '';
}

export async function postBundle(bundleString: string): Promise<string | null> {
  try {
    const token = await getToken();
    const response = await axios.post(BUNDLE_MANAGEMENT_RESOURCE, {
      token: token,
      bundle: bundleString,
    });
    return response.data.bundleId;
  } catch (error) {
    console.log('Error in posting bundle: ', error);
    return null;
  }
}
