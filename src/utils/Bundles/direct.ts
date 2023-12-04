import store from '@store/appStore';
import {
  DirectConnectionBundle,
  GeneratedDirectConnectionBundle,
} from './interfaces';
import * as storage from '../Storage/bundles';
import {getDirectConnectionLink} from '../ConnectionLinks/direct';
import {generateKeyPair, generateRandomNonce} from '../Crypto/x25519';
import {sha256} from '../Crypto/sha';
import {generateISOTimeStamp} from '../Time';
import {connectionFsSync} from '../Synchronization';
import {ConnectionType} from '../Connections/interfaces';
import {BUNDLE_VALIDITY_INTERVAL} from '@configs/constants';

/**
 * Checks if a bundle is still valid.
 * @param {string} timestamp - timestamp of when the bundle was created
 * @param {number} acceptedDuration - how long the bundle is valid
 * @returns {boolean} - true if token is still valid
 */
function checkBundleValidity(
  timestamp: string,
  acceptedDuration: number = BUNDLE_VALIDITY_INTERVAL,
): boolean {
  try {
    const timeStamp: Date = new Date(timestamp);
    const now: Date = new Date();
    const timeDiff = now.getTime() - timeStamp.getTime();
    if (timeDiff <= acceptedDuration) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

/**
 * Loads read bundles to store
 * @deprecated
 */
export async function loadReadDirectConnectionBundlesToStore() {
  try {
    await getReadDirectConnectionBundles();
  } catch (error) {
    console.log(
      'Error loading bundles from storage and loading to store: ',
      error,
    );
  }
}

/**
 * Saves read bundle.
 * @param {DirectConnectionBundle} bundle - bundle to be saved.
 * @deprecated
 */
export async function saveReadDirectConnectionBundle(
  bundle: DirectConnectionBundle,
) {
  //add to cache
  store.dispatch({
    type: 'ADD_TO_READ_BUNDLES',
    payload: bundle,
  });
  //add to storage
  const entireState = store.getState();
  const bundles: DirectConnectionBundle[] = entireState.readBundles.bundles;
  await storage.saveReadDirectConnectionBundles([...bundles, bundle]);
}

/**
 * saves generated bundle to storage.
 * @param {GeneratedDirectConnectionBundle} bundle - generated bundle to save
 */
export async function saveGeneratedDirectConnectionBundle(
  bundle: GeneratedDirectConnectionBundle,
) {
  const synced = async () => {
    const generatedBundles = await getGeneratedDirectConnectionBundles(false);
    let index: number = generatedBundles.findIndex(
      obj => obj.data.linkId === bundle.data.linkId,
    );
    if (index === -1) {
      await storage.saveGeneratedDirectConnectionBundles(
        [...generatedBundles, bundle],
        false,
      );
    }
  };
  await connectionFsSync(synced);
}

export async function deleteGeneratedDirectConnectionBundle(linkId: string) {
  const synced = async () => {
    const generatedBundles = await getGeneratedDirectConnectionBundles();
    await storage.saveGeneratedDirectConnectionBundles(
      generatedBundles.filter(bundle => bundle.data.linkId !== linkId),
    );
  };
  await connectionFsSync(synced);
}

/**
 * Gets the read direct connection bundles. cleans up and automatically removes timed out bundles
 * @returns {Promise<DirectConnectionBundle[]>} - A promise that resolves to the read direct connection bundles.
 * @deprecated
 */
export async function getReadDirectConnectionBundles(): Promise<
  DirectConnectionBundle[]
> {
  const entireState = store.getState();
  const bundles: DirectConnectionBundle[] = entireState.readBundles.bundles;
  if (bundles.length === 0) {
    const readBundles = await storage.getReadDirectConnectionBundles();
    if (readBundles.length === 0) {
      return readBundles;
    }
    const validReadBundles = readBundles.filter(bundle =>
      checkBundleValidity(bundle.timestamp),
    );
    if (validReadBundles.length !== readBundles.length) {
      await storage.saveReadDirectConnectionBundles(validReadBundles);
    }
    if (validReadBundles.length >= 1) {
      store.dispatch({
        type: 'UPDATE_READ_BUNDLES',
        payload: validReadBundles,
      });
    }
    return validReadBundles;
  } else {
    const validReadBundles = bundles.filter(bundle =>
      checkBundleValidity(bundle.timestamp),
    );
    if (validReadBundles.length !== bundles.length) {
      if (validReadBundles.length >= 1) {
        store.dispatch({
          type: 'UPDATE_READ_BUNDLES',
          payload: validReadBundles,
        });
      }
    }
    return validReadBundles;
  }
}

/**
 * Gets the generated direct connection bundles. cleans up and automatically removes timed out bundles
 * @returns {Promise<GeneratedDirectConnectionBundle[]>} - A promise that resolves to the generated direct connection bundles.
 */
export async function getGeneratedDirectConnectionBundles(
  blocking: boolean = false,
): Promise<GeneratedDirectConnectionBundle[]> {
  const synced = async () => {
    const generatedBundles = await storage.getGeneratedDirectConnectionBundles(
      false,
    );
    const validGeneratedBundles = generatedBundles.filter(bundle =>
      checkBundleValidity(bundle.timestamp),
    );
    if (validGeneratedBundles.length !== generatedBundles.length) {
      await storage.saveGeneratedDirectConnectionBundles(
        validGeneratedBundles,
        false,
      );
    }
    return validGeneratedBundles;
  };
  if (blocking) {
    return await connectionFsSync(synced);
  } else {
    return synced();
  }
}

/**
 * Gets a generated direct connection bundle.
 * @param {string} linkId - linkId of the generated bundle
 * @returns {Promise<GeneratedDirectConnectionBundle>} - A promise that resolves to the generated direct connection bundle.
 */
export async function getGeneratedDirectConnectionBundle(
  linkId: string,
): Promise<GeneratedDirectConnectionBundle> {
  const generatedBundles = await getGeneratedDirectConnectionBundles(true);
  let index: number = generatedBundles.findIndex(
    obj => obj.data.linkId === linkId,
  );
  if (index === -1) {
    throw new Error('No such generated direct connection bundle');
  }
  return generatedBundles[index];
}

/**
 * generates a valid bundle and returns it. return null incase of failure.
 * @returns {Promise<DirectConnectionBundle | null>} - depending on whether the generate was successful
 */
export async function generateDirectConnectionBundle(
  label: string = '',
): Promise<DirectConnectionBundle> {
  const linkId = await getDirectConnectionLink();
  if (linkId === null) {
    throw new Error('out of links');
  } else {
    const keys = await generateKeyPair();
    const nonce = await generateRandomNonce();
    const hash = await sha256(keys.pubKey);
    const bundle: DirectConnectionBundle = {
      org: 'numberless.tech',
      timestamp: generateISOTimeStamp(),
      connectionType: ConnectionType.direct,
      version: '1.0.0',
      data: {
        linkId: linkId,
        nonce: nonce,
        pubkeyHash: hash,
      },
    };
    const generatedBundle: GeneratedDirectConnectionBundle = {
      ...bundle,
      keys: keys,
      timestamp: generateISOTimeStamp(),
      label: label,
    };
    await saveGeneratedDirectConnectionBundle(generatedBundle);
    return bundle;
  }
}

/**
 * Updates the generated connection bundle label
 * @param {string} linkId  - linkId to find the generated bundle
 * @param {string} newLabel - new label to update with
 */
export async function updateGeneratedDirectConnectionBundleLabel(
  linkId: string,
  newLabel: string,
) {
  let generatedBundles = await getGeneratedDirectConnectionBundles();
  let index: number = generatedBundles.findIndex(
    obj => obj.data.linkId === linkId,
  );
  if (index !== -1) {
    generatedBundles[index].label = newLabel;
    await storage.saveGeneratedDirectConnectionBundles(generatedBundles);
  } else {
    throw new Error('No such generated direct connection bundle');
  }
}
