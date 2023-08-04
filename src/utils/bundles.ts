import RNFS from 'react-native-fs';
import {generatedBundlesPath, readBundlesPath} from '../configs/paths';
import {getLineLink} from './linelinks';
import {connectionFsSync} from './syncronization';
import {getToken} from './Token';
import axios from 'axios';
import {BUNDLE_MANAGEMENT_RESOURCE} from '../configs/api';

export interface bundle {
  type: string; //contact or group
  bundles: {
    version: string;
    label?: string;
    data: {
      linkId: string;
      nonce?: string;
      pubkeyHash?: string;
    };
  };
  org: string;
}

//checks whether read qr data is a numberless bundle.
export function checkBundleData(qrData: string) {
  const bundle = JSON.parse(qrData);
  if (bundle.org !== 'numberless.tech') {
    throw new Error('Organisation data incorrect');
  }
  if (typeof bundle.type !== 'string') {
    throw new Error('Bundle type incorrect');
  }
  if (typeof bundle.bundles === 'undefined') {
    throw new Error('bundle not present');
  } else {
    if (typeof bundle.bundles.version !== 'string') {
      throw new Error('version data incorrect');
    }
    if (typeof bundle.bundles.data === 'undefined') {
      throw new Error('bundle data not present');
    } else {
      if (typeof bundle.bundles.data.linkId !== 'string') {
        throw new Error('linkId is not a string');
      }
    }
  }
  return bundle;
}

//save read bundle
export async function saveReadBundle(readBundle: bundle) {
  const synced = async () => {
    const pathToFile = `${RNFS.DocumentDirectoryPath}/${readBundlesPath}`;
    const isFile = await RNFS.exists(pathToFile);
    if (isFile) {
      const bundlesDataJSON = await RNFS.readFile(pathToFile, 'utf8');
      const bundlesData: Array<bundle> = JSON.parse(bundlesDataJSON);
      const newBundles: Array<bundle> = [...[readBundle], ...bundlesData];
      await RNFS.writeFile(pathToFile, JSON.stringify(newBundles), 'utf8');
    } else {
      await RNFS.writeFile(pathToFile, JSON.stringify([readBundle]), 'utf8');
    }
  };
  await connectionFsSync(synced);
}

//read saved bundles
export async function readSavedReadBundles() {
  const synced = async () => {
    const pathToFile = `${RNFS.DocumentDirectoryPath}/${readBundlesPath}`;
    const isFile = await RNFS.exists(pathToFile);
    if (isFile) {
      const bundlesData: Array<bundle> = JSON.parse(
        await RNFS.readFile(pathToFile, 'utf8'),
      );
      return bundlesData;
    } else {
      return null;
    }
  };
  return await connectionFsSync(synced);
}

//generate bundle
//TODO: add keys to an associated crypto file
export async function generateLineBundle() {
  const linkId = await getLineLink();
  console.log('linkid: ', linkId);
  if (linkId === null) {
    return null;
  } else {
    const bundle: bundle = {
      type: 'line',
      org: 'numberless.tech',
      bundles: {version: '0.0.1', data: {linkId: linkId}},
    };
    return bundle;
  }
}

//save generated bundle
export async function saveGeneratedBundle(generatedBundle: bundle) {
  const synced = async () => {
    const pathToFile = `${RNFS.DocumentDirectoryPath}/${generatedBundlesPath}`;
    const isFile = await RNFS.exists(pathToFile);
    if (isFile) {
      const bundlesDataJSON = await RNFS.readFile(pathToFile, 'utf8');
      const bundlesData: Array<bundle> = JSON.parse(bundlesDataJSON);
      const newBundles: Array<bundle> = [...[generatedBundle], ...bundlesData];
      await RNFS.writeFile(pathToFile, JSON.stringify(newBundles), 'utf8');
    } else {
      await RNFS.writeFile(
        pathToFile,
        JSON.stringify([generatedBundle]),
        'utf8',
      );
    }
  };
  await connectionFsSync(synced);
}

//read generated bundles
export async function readSavedGeneratedBundles() {
  const synced = async () => {
    const pathToFile = `${RNFS.DocumentDirectoryPath}/${generatedBundlesPath}`;
    const isFile = await RNFS.exists(pathToFile);
    if (isFile) {
      const bundlesData: Array<bundle> = JSON.parse(
        await RNFS.readFile(pathToFile, 'utf8'),
      );
      return bundlesData;
    } else {
      return null;
    }
  };
  return await connectionFsSync(synced);
}

//delete saved read bundle

//delete saved generated bundle

//update label

//delete all generated bundles
export async function deleteAllGeneratedBundles() {
  const synced = async () => {
    const pathToFile = `${RNFS.DocumentDirectoryPath}/${generatedBundlesPath}`;
    await RNFS.writeFile(pathToFile, JSON.stringify([]), 'utf8');
  };
  await connectionFsSync(synced);
}
//delete all read bundles
export async function deleteAllReadBundles() {
  const synced = async () => {
    const pathToFile = `${RNFS.DocumentDirectoryPath}/${readBundlesPath}`;
    await RNFS.writeFile(pathToFile, JSON.stringify([]), 'utf8');
  };
  await connectionFsSync(synced);
}

export async function postBundle(bundleString: string): Promise<string | null> {
  try {
    const token = await getToken();
    if (token) {
      const response = await axios.post(BUNDLE_MANAGEMENT_RESOURCE, {
        token: token,
        bundle: bundleString,
      });
      return response.data.bundleId;
    }
    return null;
  } catch (error) {
    console.log('Error in posting bundle: ', error);
    return null;
  }
}
