import {Mutex} from 'async-mutex';

import {
  defaultFolderId,
  defaultPermissions,
} from '@configs/constants';

import store from '@store/appStore';

import CryptoDriver from '@utils/Crypto/CryptoDriver';
import { getBasicConnectionInfo } from '@utils/Storage/connections';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';
import { PortData } from '@utils/Storage/DBCalls/ports/myPorts';
import {ReadPortData} from '@utils/Storage/DBCalls/ports/readPorts';
import { SuperportData } from '@utils/Storage/DBCalls/ports/superPorts';
import * as storageMyPorts from '@utils/Storage/myPorts';
import * as storagePermissions from '@utils/Storage/permissions';
import * as storageReadPorts from '@utils/Storage/readPorts';
import * as storageSuperPorts from '@utils/Storage/superPorts';
import {hasExpired} from '@utils/Time';

import { ContactPort } from './ContactPorts/ContactPort';
import { GroupPort } from './GroupPorts/GroupPort';
import { GroupSuperPort } from './GroupSuperPorts/GroupSuperPort';
import {
  DirectContactPortBundle,
  DirectSuperportBundle,
  GroupBundle,
  GroupSuperportBundle,
  PortBundle,
} from './interfaces';
import {Port} from './SingleUsePorts/Port';
import {SuperPort} from './SuperPorts/SuperPort';


/**
 * Checks if a scanned/clicked raw string is a valid port QR or link
 * @param rawString
 * @returns - valid bundle
 */
export function checkBundleValidity(
  rawString: string | Record<string, string | number>,
):
  | PortBundle
  | GroupBundle
  | DirectSuperportBundle
  | GroupSuperportBundle
  | DirectContactPortBundle {
  const bundle =
    typeof rawString === 'string' ? JSON.parse(rawString) : rawString;

  if (bundle.org !== 'numberless.tech') {
    throw new Error('Organisation data incorrect');
  }
  if (
    !(
      bundle.target === BundleTarget.direct ||
      bundle.target === BundleTarget.group ||
      bundle.target === BundleTarget.superportDirect ||
      bundle.target === BundleTarget.superportGroup ||
      bundle.target === BundleTarget.contactPort
    )
  ) {
    throw new Error('Bundle target not supported');
  }
  return bundle;
}

/**
 * Reads a port bundle and store it.
 * @param bundle
 * @param channel
 * @param folderId
 */
export async function readBundle(
  bundle:
    | PortBundle
    | GroupBundle
    | DirectSuperportBundle
    | GroupSuperportBundle
    | DirectContactPortBundle,
  _channel: string | null = null,
  folderId: string = defaultFolderId,
) {
  try {
    switch (bundle.target) {
      case BundleTarget.direct:
        await Port.reader.accept(bundle as PortBundle, defaultPermissions, folderId);
        break;
      case BundleTarget.group:
        await GroupPort.reader.accept(bundle as GroupBundle, defaultPermissions, folderId);
        break;
      case BundleTarget.superportDirect:
        await SuperPort.reader.accept(bundle as DirectSuperportBundle, defaultPermissions, folderId);
        break;
      case BundleTarget.contactPort:
        await ContactPort.reader.accept(bundle as DirectContactPortBundle, defaultPermissions, folderId);
        break;
      case BundleTarget.superportGroup:
        await GroupSuperPort.reader.accept(bundle as GroupSuperportBundle, defaultPermissions, folderId);
        break;  
      default:
        break;
    }
  } catch (error) {
    console.log('Error using read bundle: ', error);
  }
  store.dispatch({
    type: 'PING',
    payload: 'PONG',
  });
}

/**
 * Use a read bundle to form a connection or join a group
 * @param readBundle
 */
async function useReadBundle(readBundle: ReadPortData) {
  try {
    switch (readBundle.target) {
      case BundleTarget.direct:
        await Port.reader.load(readBundle).use();
        break;
      case BundleTarget.group:
        await GroupPort.reader.load(readBundle).use();
        break;
      case BundleTarget.superportDirect:
        await SuperPort.reader.load(readBundle).use();
        break;
      case BundleTarget.contactPort:
        await ContactPort.reader.load(readBundle).use();
        break;
      case BundleTarget.superportGroup:
        await GroupSuperPort.reader.load(readBundle).use();
        break;
      default:
        break;
    }
  } catch (error) {
    console.log('Error using read bundle: ', error);
  }
  store.dispatch({
    type: 'PING',
    payload: 'PONG',
  });
}

const bundleProcessLock = new Mutex();
/**
 * Same as above function with nomenclature change because 'use' is a hook precursor
 */
export async function processReadBundles() {
  try {
    // We lock bundle processing to prevent multiple uses of the same bundles
    await bundleProcessLock.acquire();
    const readBundles = await storageReadPorts.getReadPorts();
    for (let index = 0; index < readBundles.length; index++) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      await useReadBundle(readBundles[index]);
    }
  } catch (error) {
    console.log('Error using read bundles: ', error);
  }
  bundleProcessLock.release();
}

/**
 * Get all read ports
 * @returns - all read ports
 */
export async function getReadPorts() {
  return await storageReadPorts.getReadPorts();
}

/**
 * Clean deletes a read port
 * @param portId - port id of the read port
 */
export async function cleanDeleteReadPort(portId: string) {
  try {
    const readPort = await storageReadPorts.getReadPortData(portId);
    if (!readPort) {
      throw new Error('NoSuchReadPort');
    }
    await storageReadPorts.deleteReadPortData(readPort.portId);
    if (readPort.cryptoId) {
      const cryptoDriver = new CryptoDriver(readPort.cryptoId);
      await cryptoDriver.deleteCryptoData();
    }
    if (readPort.permissionsId) {
      await storagePermissions.clearPermissions(readPort.permissionsId);
    }
  } catch (error) {
    console.log('Error deleting read port: ', error);
  }
}

/**
 * Delete expired ports
 */
export async function cleanUpPorts() {
  await cleanUpExpiredGeneratedPorts();
  await cleanUpExpiredReadPorts();
}

/**
 * Clean deletes all expired generated ports
 */
async function cleanUpExpiredGeneratedPorts() {
  try {
    const generatedPorts = await storageMyPorts.getUsedPorts();
    for (let index = 0; index < generatedPorts.length; index++) {
      if (hasExpired(generatedPorts[index].expiryTimestamp)) {
        await storageMyPorts.deletePortData(generatedPorts[index].portId);
        if (generatedPorts[index].cryptoId) {
          const cryptoDriver = new CryptoDriver(generatedPorts[index].cryptoId);
          await cryptoDriver.deleteCryptoData();
        }
      }
    }
  } catch (error) {
    console.log('Error cleaning up expired generated ports', error);
  }
}

/**
 * Delete all expired read ports
 */
async function cleanUpExpiredReadPorts() {
  try {
    const readPorts = await storageReadPorts.getReadPorts();
    for (let index = 0; index < readPorts.length; index++) {
      if (hasExpired(readPorts[index].expiryTimestamp)) {
        await storageReadPorts.deleteReadPortData(readPorts[index].portId);
        if (readPorts[index].cryptoId) {
          const cryptoDriver = new CryptoDriver(readPorts[index].cryptoId);
          await cryptoDriver.deleteCryptoData();
        }
      }
    }
  } catch (error) {
    console.log('Error cleaning up expired read ports', error);
  }
}

/**
 * Disable contact sharing for a direct chat
 * @param chatId
 */
export async function pauseContactPortForDirectChat(chatId: string) {
  const connection = await getBasicConnectionInfo(chatId);
  const contactPort = await ContactPort.generator.shared.fromPairHash(connection.pairHash);
  await contactPort.pause();
}

/**
 * Resume contact sharing for a direct chat
 * @param chatId
 */
export async function resumeContactPortForDirectChat(chatId: string) {
  const connection = await getBasicConnectionInfo(chatId);
  const contactPort = await ContactPort.generator.shared.fromPairHash(connection.pairHash);
  await contactPort.resume();
}

interface GeneratedPortsAndSuperportsBase {
  sortTimestamp: string;
  isSuperport: boolean;
}

export interface GeneratedPortData extends GeneratedPortsAndSuperportsBase, PortData {
}

export interface GeneratedSuperportData extends GeneratedPortsAndSuperportsBase, SuperportData {
}

export type GeneratedPortsAndSuperports = GeneratedPortData | GeneratedSuperportData;

/**
 * Get all generated ports and superports
 * @returns - all ports generated and reusable
 */
export async function getGeneratedPortsAndSuperports(): Promise<GeneratedPortsAndSuperports[]> {
  const generatedPorts = await storageMyPorts.getUsedPorts();
  const superports = await storageSuperPorts.getAllSuperports();
  
  // Combine ports and superports into a single array
  const combinedPorts = [
    ...generatedPorts.map(port => ({ 
      ...port, 
      sortTimestamp: port.usedOnTimestamp,
      isSuperport: false,
    })),
    ...superports.map(superport => ({ 
      ...superport, 
      sortTimestamp: superport.createdOnTimestamp,
      isSuperport: true,
    }))
  ];
  
  // Sort the combined array by timestamp
  combinedPorts.sort((a, b) => {
    if (!a.sortTimestamp) return 1;
    if (!b.sortTimestamp) return -1;
    return a.sortTimestamp.localeCompare(b.sortTimestamp);
  });

  return combinedPorts;
}