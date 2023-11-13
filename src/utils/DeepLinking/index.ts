import axios from 'axios';

import {BUNDLE_MANAGEMENT_RESOURCE} from '../../configs/api';
import {ConnectionType} from '../Connections/interfaces';
import {handshakeActionsB1} from '../DirectChats/handshake';
import {handshakeActionsG1} from '../Groups/handshake';
import {getToken} from '../ServerAuth';
import {connectionFsSync} from '../Synchronization';

interface urlObject {
  url: string | null;
}
export async function handleDeepLink(urlObj: urlObject) {
  const synced = async () => {
    const url = urlObj.url;
    if (url) {
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
  try {
    const bundle = JSON.parse(await connectionFsSync(synced));
    if (bundle.connectionType === ConnectionType.direct) {
      await handshakeActionsB1(bundle);
    }
    if (bundle.connectionType === ConnectionType.group) {
      await handshakeActionsG1(bundle);
    }
    if (bundle.connectionType === ConnectionType.superport) {
      if (bundle.data.superportType === 'direct') {
        await handshakeActionsB1(bundle);
      }
    }
  } catch (error) {
    console.log('Error with deep linking: ', error);
  }
}

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

export async function convertBundleToLink(bundleData: string) {
  const bundleId = await postBundle(bundleData);
  const url = 'https://it.numberless.tech/connect?bundleId=' + bundleId;

  return url;
}

export async function postBundle(bundleString: string): Promise<string | null> {
  const token = await getToken();
  const response = await axios.post(
    BUNDLE_MANAGEMENT_RESOURCE,
    {
      bundle: bundleString,
    },
    {headers: {Authorization: `${token}`}},
  );
  return response.data.bundleId;
}
