import RNFS from 'react-native-fs';
import {generatedBundlesPath, readBundlesPath} from '../configs/paths';
import { getLineLink } from './linelinks';

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
    if (bundle.org !== "numberless.tech") {
        throw new Error("Organisation data incorrect");
    }
    if (typeof bundle.type !== 'string') {
        throw new Error("Bundle type incorrect");
    }
    if (typeof bundle.bundles === 'undefined') {
        throw new Error("bundle not present");
    }
    else {
        if (typeof bundle.bundles.version !== 'string') {
            throw new Error("version data incorrect");
        }
        if (typeof bundle.bundles.data === 'undefined') {
            throw new Error("bundle data not present");
        }
        else {
            if (typeof bundle.bundles.data.linkId !== 'string') {
                throw new Error("linkId is not a string");
            }
        }
    }
    return bundle;
}

//save read bundle
export async function saveReadBundle(readBundle: bundle) {
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
}

//read saved bundles
export async function readSavedReadBundles() {
    const pathToFile = `${RNFS.DocumentDirectoryPath}/${readBundlesPath}`;
    const isFile = await RNFS.exists(pathToFile);
    if (isFile) {
        const bundlesData: Array<bundle> = JSON.parse(await RNFS.readFile(pathToFile, 'utf8'));
        return bundlesData;
    } else {
        return null;
    }
}

//generate bundle
export async function generateLineBundle() {
    const linkId = await getLineLink();
    if (linkId === null) {
        return null;
    } else {
        const bundle:bundle = {type:"line", org:"numberless.tech", bundles:{version:"0.0.1", data:{linkId:linkId}}};
        return bundle;
    }
}

//save generated bundle
export async function saveGeneratedBundle(generatedBundle: bundle) {
    const pathToFile = `${RNFS.DocumentDirectoryPath}/${generatedBundlesPath}`;
    const isFile = await RNFS.exists(pathToFile);
    if (isFile) {
      const bundlesDataJSON = await RNFS.readFile(pathToFile, 'utf8');
      const bundlesData: Array<bundle> = JSON.parse(bundlesDataJSON);
      const newBundles: Array<bundle> = [...[generatedBundle], ...bundlesData];
      await RNFS.writeFile(pathToFile, JSON.stringify(newBundles), 'utf8');
    } else {
      await RNFS.writeFile(pathToFile, JSON.stringify([generatedBundle]), 'utf8');
    }
}

//read generated bundles
export async function readSavedGeneratedBundles() {
    const pathToFile = `${RNFS.DocumentDirectoryPath}/${generatedBundlesPath}`;
    const isFile = await RNFS.exists(pathToFile);
    if (isFile) {
        const bundlesData: Array<bundle> = JSON.parse(await RNFS.readFile(pathToFile, 'utf8'));
        return bundlesData;
    } else {
        return null;
    }
}

//delete saved read bundle

//delete saved generated bundle

//update label

//delete all generated bundles
export async function deleteAllGeneratedBundles() {
    const pathToFile = `${RNFS.DocumentDirectoryPath}/${generatedBundlesPath}`;
    await RNFS.writeFile(pathToFile, JSON.stringify([]), 'utf8');
}
//delete all read bundles
export async function deleteAllReadBundles() {
    const pathToFile = `${RNFS.DocumentDirectoryPath}/${readBundlesPath}`;
    await RNFS.writeFile(pathToFile, JSON.stringify([]), 'utf8');
}