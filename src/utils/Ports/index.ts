import {expiryOptions, expiryOptionsTypes} from '@utils/Time/interfaces';
import {
  BundleType,
  DirectContactPortBundle,
  DirectSuperportBundle,
  GroupBundle,
  GroupSuperportBundle,
  PortBundle,
} from './interfaces';
import {BundleTarget, PortTable} from '@utils/Storage/DBCalls/ports/interfaces';
import {ReadPortData} from '@utils/Storage/DBCalls/ports/readPorts';
import {SuperportData} from '@utils/Storage/DBCalls/ports/superPorts';
import {PortData} from '@utils/Storage/DBCalls/ports/myPorts';
import {
  DEFAULT_NAME,
  defaultFolderId,
  defaultSuperportConnectionsLimit,
} from '@configs/constants';
import * as direct from './direct';
import * as group from './group';
import * as superport from './superport';
import * as contactPort from './contactport';
import * as storageReadPorts from '@utils/Storage/readPorts';
import store from '@store/appStore';
import {hasExpired} from '@utils/Time';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import {ChatType} from '@utils/Storage/DBCalls/connections';
import DirectChat, {IntroMessage} from '@utils/DirectChats/DirectChat';
import {Mutex} from 'async-mutex';
import {deleteDirectSuperport} from './APICalls';

/**
 * Mapping between different kinds of bundles and the kind of connections they lead to.
 * @param x - bundle type
 * @returns - chat type
 */
export function bundleTargetToChatType(x: BundleTarget) {
  if (
    x === BundleTarget.direct ||
    x === BundleTarget.superportDirect ||
    x === BundleTarget.contactPort
  ) {
    return ChatType.direct;
  } else {
    return ChatType.group;
  }
}

/**
 * Fetches new unused ports and puts it in storage.
 * @param groupId - optional group Id param if you need to fetch group ports
 */
export async function fetchNewPorts(groupId: string | null = null) {
  if (!groupId) {
    await direct.getNewPorts();
  } else {
    await group.getNewGroupPorts(groupId);
  }
}

/**
 * Generate a displayable bundle for a new port or group port
 * @param type - only supports groups and direct (not superport)
 * @param id - group id
 * @param label - label associated with port
 * @param expiry - expiry of port
 * @param channel - null is QR
 * @param folderId - folder to which a chat formed will go to
 * @returns - displayable bundle
 */
export async function generateBundle<T extends BundleTarget>(
  type: T,
  id: string | null = null,
  label: string | null = DEFAULT_NAME,
  expiry: expiryOptionsTypes = expiryOptions[4], //all ports expire in a week by default.
  channel: string | null = null, //assumes channel is qr if nothing specified.
  folderId: string = defaultFolderId, //uses default folder if nothing is specified.
): Promise<BundleType<T>> {
  if (type === BundleTarget.direct) {
    if (!label) {
      throw new Error('Label cannot be null in a direct port');
    }
    const newBundle = (await direct.generateNewPortBundle(
      label,
      expiry,
      channel,
      folderId,
    )) as BundleType<T>;
    return newBundle;
  } else if (type === BundleTarget.group) {
    if (!id) {
      throw new Error('GroupIdNull');
    }
    const newBundle = (await group.generateNewGroupPortBundle(
      id,
      expiry,
      channel,
      folderId,
    )) as BundleType<T>;
    return newBundle;
  } else {
    return {} as BundleType<T>;
  }
}

/**
 * Update generated direct port label
 * @param portId
 * @param label
 */
export async function updateGeneratedPortLabel(portId: string, label: string) {
  await direct.updateGeneratedPortLabel(portId, label);
}

/**
 * Update generated direct superport port label
 * @param portId
 * @param label
 */
export async function updateGeneratedSuperportLabel(
  portId: string,
  label: string,
) {
  await superport.updateGeneratedSuperportLabel(portId, label);
}

/**
 * Update folder assigned to a superport
 * @param portId
 * @param folderId
 */
export async function updateGeneratedSuperportFolder(
  portId: string,
  folderId: string,
) {
  await superport.updateGeneratedSuperportFolder(portId, folderId);
}

/**
 * Fetches a superport. If no superportId is specified, creates a new superport
 * @param superportId
 * @param label - label added to superport if you are trying to create a new superport
 * @param connectionLimit - number of connections possible with superport
 * @param folderId - folder to which the connections should go to
 * @returns
 */
export async function fetchSuperport(
  superportId: string | null = null,
  label: string = '',
  connectionLimit: number = defaultSuperportConnectionsLimit,
  folderId: string = defaultFolderId,
): Promise<{
  bundle: DirectSuperportBundle;
  superport: SuperportData;
}> {
  if (superportId) {
    return await superport.fetchCreatedSuperportBundle(superportId);
  } else {
    return await superport.createNewSuperport(label, connectionLimit, folderId);
  }
}

/**
 * Fetches a generated port's data
 * @param portId
 * @returns - generated data
 */
export async function getGeneratedPortData(portId: string): Promise<PortData> {
  return await direct.getGeneratedPortData(portId);
}

/**
 * Fetches clickable link given a bundle
 * @param type - bundle type
 * @param portId
 * @param bundleString
 * @returns - clickable link
 */
export async function getBundleClickableLink(
  type: BundleTarget,
  portId: string,
  bundleString: string | null = null,
): Promise<string> {
  if (type === BundleTarget.direct) {
    return await direct.getPortBundleClickableLink(portId, bundleString);
  } else if (type === BundleTarget.group) {
    return await group.getGroupPortBundleClickableLink(portId, bundleString);
  } else if (type === BundleTarget.superportDirect) {
    return await superport.getSuperportBundleClickableLink(
      portId,
      bundleString,
    );
  } else if (type === BundleTarget.contactPort) {
    return await contactPort.getContactPortBundleClickableLink(
      portId,
      bundleString,
    );
  } else {
    return '';
  }
}

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
  channel: string | null = null,
  folderId: string = defaultFolderId,
) {
  try {
    switch (bundle.target) {
      case BundleTarget.direct:
        await direct.acceptPortBundle(bundle as PortBundle, channel, folderId);
        break;
      case BundleTarget.group:
        await group.acceptGroupPortBundle(
          bundle as GroupBundle,
          channel,
          folderId,
        );
        break;
      case BundleTarget.superportDirect:
        await superport.acceptSuperportBundle(
          bundle as DirectSuperportBundle,
          channel,
          folderId,
        );
        break;
      case BundleTarget.contactPort:
        await contactPort.acceptContactBundle(
          bundle as DirectContactPortBundle,
          channel,
          folderId,
        );
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
        await direct.newChatOverReadPortBundle(readBundle);
        break;
      case BundleTarget.group:
        await group.newGroupChatOverReadPortBundle(readBundle);
        break;
      case BundleTarget.superportDirect:
        await superport.newChatOverReadSuperportBundle(readBundle);
        break;
      case BundleTarget.contactPort:
        await contactPort.newChatOverReadContactPortBundle(readBundle);
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
 * Triggers a new chat store update
 * @param lineId
 * @param portId
 */
function triggerNewChatStoreUpdate(lineId: string, portId: string) {
  store.dispatch({
    type: 'NEW_CONNECTION',
    payload: {
      lineId: lineId,
      connectionLinkId: portId,
    },
  });
}

/**
 * Use a created bundle to form a new connection
 * @param lineId - chat Id created by server
 * @param portId - port Id of port used to form connection
 * @param bundleTarget - only accepts direct port and direct superport
 */
export async function useCreatedBundle(
  lineId: string,
  portId: string,
  bundleTarget: BundleTarget,
  pairHash: string,
  introMessage: IntroMessage,
) {
  try {
    switch (bundleTarget) {
      case BundleTarget.direct:
        triggerNewChatStoreUpdate(lineId, portId);
        await direct.newChatOverGeneratedPortBundle(
          portId,
          lineId,
          pairHash,
          introMessage,
        );
        break;
      case BundleTarget.superportDirect:
        await superport.newChatOverCreatedSuperportBundle(
          portId,
          lineId,
          pairHash,
          introMessage,
        );
        triggerNewChatStoreUpdate(lineId, portId);
        break;
      case BundleTarget.contactPort:
        await contactPort.newChatOverCreatedContactPortBundle(
          portId,
          lineId,
          pairHash,
          introMessage,
        );
        triggerNewChatStoreUpdate(lineId, portId);
        break;
      default:
        break;
    }
  } catch (error: any) {
    console.log('Error using created bundles: ', error);
    if (
      error &&
      error.message &&
      (error.message === 'NoSuperportFound' ||
        error.message === 'NoPortFound' ||
        error.message === 'NoContactPortFound' ||
        error.message === 'SuperportPaused')
    ) {
      //this happens when bundle has been deleted locally and somebody has used that bundle.
      //In this case, send a disconnected message to the created chat Id.
      try {
        const chat = new DirectChat();
        chat.disconnect(lineId);
        if (bundleTarget === BundleTarget.superportDirect) {
          if (error.message === 'NoSuperportFound') {
            deleteDirectSuperport(portId);
          }
          if (error.message === 'SuperportPaused') {
            superport.pauseSuperport(portId);
          }
        }
      } catch {
        console.error('Error occurred while disconnecting:', error);
      }
    }
  }
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

export async function numberOfPendingRequests() {
  //generated ports
  const generatedPorts = await direct.getAllGeneratedPorts();
  return generatedPorts.length;
}

/**
 * Fetch all created superports to display on superports screen.
 * @returns - list of all created superports
 */
export async function getAllCreatedSuperports(): Promise<SuperportData[]> {
  return await superport.getAllCreatedSuperports();
}

/**
 * Clean delete a port
 * @param portId
 * @param table - type of port
 */
export async function cleanDeletePort(portId: string, table: PortTable) {
  switch (table) {
    case PortTable.generated:
      await direct.cleanDeleteGeneratedPort(portId);
      break;
    case PortTable.read:
      await direct.cleanDeleteReadPort(portId);
      break;
    case PortTable.group:
      await group.cleanDeleteGeneratedGroupPort(portId);
      break;
    case PortTable.superport:
      await superport.cleanDeleteSuperport(portId);
      break;
    default:
      break;
  }
}

/**
 * Delete expired ports
 */
export async function cleanUpPorts() {
  await direct.cleanUpExpiredGeneratedPorts();
  await cleanUpExpiredReadPorts();
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
 * Fetch a read port
 * @param portId
 * @returns - read port
 */
export async function getReadPort(
  portId: string,
): Promise<ReadPortData | null> {
  return await storageReadPorts.getReadPortData(portId);
}

/**
 * Describes the data that is required by a pending port card
 */
export interface PendingCardInfo {
  portId: string;
  name: string;
  isLink: boolean;
  createdOn: string;
}

/**
 * Get a list of items to display on pending requests screen.
 * @todo - get rid of this helper as pending requests screen is no longer necessary.
 * @returns - list of items to display
 */
export async function getPendingRequests(): Promise<PendingCardInfo[]> {
  await cleanUpPorts();
  const pendingRequests: PendingCardInfo[] = [];
  //generated ports
  const generatedPorts = await direct.getAllGeneratedPorts();
  const morphedGeneratedPorts = generatedPorts.map(port => {
    const pendingRequest: PendingCardInfo = {
      portId: port.portId,
      name:
        port.label && port.label !== DEFAULT_NAME
          ? port.label
          : 'Port #' + port.portId,
      isLink: port.channel ? true : false,
      createdOn: port.usedOnTimestamp,
    };
    return pendingRequest;
  });
  pendingRequests.push(...morphedGeneratedPorts);
  return pendingRequests.sort(
    (a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime(),
  );
}
