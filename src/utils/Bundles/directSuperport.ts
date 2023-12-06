import {getNewDirectConnectionSuperport} from '../ConnectionLinks/directSuperport';
import {ConnectionType} from '../Connections/interfaces';
import {sha256} from '../Crypto/sha';
import {generateKeyPair, generateRandomNonce} from '../Crypto/x25519';
import * as storage from '../Storage/bundles';
import {connectionFsSync} from '../Synchronization';
import {generateISOTimeStamp} from '../Time';
import {
  DirectSuperportConnectionBundle,
  GeneratedDirectSuperportConnectionBundle,
} from './interfaces';

export async function loadGeneratedSuperport(
  superportId: string,
): Promise<GeneratedDirectSuperportConnectionBundle> {
  const generatedBundles =
    await storage.getGeneratedSuperportDirectConnectionBundles(true);
  let index: number = generatedBundles.findIndex(
    value => value.data.linkId === superportId,
  );
  if (index === -1) {
    throw new Error('No such superport');
  }
  return generatedBundles[index];
}

export async function saveNewGeneratedSuperport(
  bundle: GeneratedDirectSuperportConnectionBundle,
) {
  const synced = async () => {
    const generatedBundles =
      await storage.getGeneratedSuperportDirectConnectionBundles(false);
    let index: number = generatedBundles.findIndex(
      value => value.data.linkId === bundle.data.linkId,
    );
    if (index === -1) {
      await storage.saveGeneratedSuperportDirectConnectionBundles(
        [...generatedBundles, bundle],
        false,
      );
    }
  };
  await connectionFsSync(synced);
}

export async function loadGeneratedSuperports() {
  const generatedBundles =
    await storage.getGeneratedSuperportDirectConnectionBundles(true);
  return generatedBundles;
}

export async function closeGeneratedSuperport(superportId: string) {
  //close api
  //delete locally
  const synced = async () => {
    const generatedBundles =
      await storage.getGeneratedSuperportDirectConnectionBundles(false);
    const filteredBundles = generatedBundles.filter(
      bundle => bundle.data.linkId !== superportId,
    );
    await storage.saveGeneratedSuperportDirectConnectionBundles(
      filteredBundles,
      false,
    );
  };
  await connectionFsSync(synced);
}

export async function updateGeneratedDirectSuperportConnectionBundleLabel(
  superportId: string,
  newLabel: string,
) {
  const synced = async () => {
    let generatedBundles =
      await storage.getGeneratedSuperportDirectConnectionBundles(false);
    let index: number = generatedBundles.findIndex(
      obj => obj.data.linkId === superportId,
    );
    if (index !== -1) {
      generatedBundles[index].label = newLabel;
      await storage.saveGeneratedSuperportDirectConnectionBundles(
        generatedBundles,
        false,
      );
    } else {
      throw new Error('No such generated direct connection bundle');
    }
  };
  await connectionFsSync(synced);
}

export async function generateDirectSuperportConnectionBundle(
  label: string = '',
): Promise<DirectSuperportConnectionBundle> {
  const linkId = await getNewDirectConnectionSuperport();
  if (linkId === null) {
    throw new Error('out of superports');
  } else {
    const keys = await generateKeyPair();
    const nonce = await generateRandomNonce();
    const hash = await sha256(keys.pubKey);
    const bundle: DirectSuperportConnectionBundle = {
      org: 'numberless.tech',
      timestamp: generateISOTimeStamp(),
      connectionType: ConnectionType.superport,
      version: '1.0.0',
      data: {
        linkId: linkId,
        superportType: 'direct',
        nonce: nonce,
        pubkeyHash: hash,
      },
    };
    const generatedBundle: GeneratedDirectSuperportConnectionBundle = {
      ...bundle,
      keys: keys,
      timestamp: generateISOTimeStamp(),
      label: label,
      lastUsed: generateISOTimeStamp(),
    };
    await saveNewGeneratedSuperport(generatedBundle);
    return bundle;
  }
}
