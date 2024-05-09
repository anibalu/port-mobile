import {expiryOptions, expiryOptionsTypes} from '@utils/Time/interfaces';
import {
  BundleTarget,
  BundleType,
  DirectSuperportBundle,
  GroupBundle,
  GroupSuperportBundle,
  PendingCardInfo,
  PortBundle,
  PortData,
  PortTable,
  ReadPortData,
  SuperportData,
} from './interfaces';
import {
  DEFAULT_NAME,
  defaultFolderId,
  defaultSuperportConnectionsLimit,
} from '@configs/constants';
import * as direct from './direct';
import * as group from './group';
import * as superport from './superport';
import * as storageReadPorts from '@utils/Storage/readPorts';
import store from '@store/appStore';
import {hasExpired} from '@utils/Time';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import {ChatType} from '@utils/Connections/interfaces';
import {jsonToUrl} from '@utils/JsonToUrl';

export function bundleTargetToChatType(x: BundleTarget) {
  if (x === BundleTarget.direct || x === BundleTarget.superportDirect) {
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
 * Triggers a reload of the Pending Requests page.
 */
export function triggerPendingRequestsReload() {
  store.dispatch({
    type: 'TRIGGER_RELOAD',
  });
}

/**
 * Triggers a new chat store update
 * @param chatId
 * @param portId
 */
export function triggerNewChatStoreUpdate(chatId: string, portId: string) {
  store.dispatch({
    type: 'NEW_CONNECTION',
    payload: {
      chatId: chatId,
      connectionLinkId: portId,
    },
  });
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
  expiry: expiryOptionsTypes = expiryOptions[4],
  channel: string | null = null,
  folderId: string = defaultFolderId,
): Promise<string | BundleType<T> | null> {
  if (type === BundleTarget.direct) {
    if (!label) {
      throw new Error('LabelNull');
    }
    const newBundle = await direct.generateNewPortBundle(
      label,
      expiry,
      channel,
      folderId,
    );
    triggerPendingRequestsReload();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {expiryTimestamp, ...newObj} = newBundle;
    const updatedBundle = jsonToUrl(newObj as any);
    return updatedBundle;
  } else if (type === BundleTarget.group) {
    if (!id) {
      throw new Error('GroupIdNull');
    }
    const newBundle = (await group.generateNewGroupPortBundle(
      id,
      channel,
      folderId,
    )) as BundleType<T>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {expiryTimestamp, ...newObj} = newBundle;
    const updatedBundle = jsonToUrl(newObj as any);
    return updatedBundle;
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
 * Update generated direct superport connections limit
 * @param portId
 * @param newLimit
 */
export async function updateGeneratedSuperportLimit(
  portId: string,
  newLimit: number,
) {
  await superport.updateGeneratedSuperportLimit(portId, newLimit);
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
): PortBundle | GroupBundle | DirectSuperportBundle | GroupSuperportBundle {
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
      bundle.target === BundleTarget.superportGroup
    )
  ) {
    throw new Error('Bundle target not supported');
  }
  return bundle;
}

/**
 * Reads a port bundle
 * @param bundle
 * @param channel
 * @param folderId
 */
export async function readBundle(
  bundle:
    | PortBundle
    | GroupBundle
    | DirectSuperportBundle
    | GroupSuperportBundle,
  channel: string | null = null,
  folderId: string = defaultFolderId,
) {
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
    default:
      break;
  }
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
 * Use a created bundle to form a new connection
 * @param chatId - chat Id created by server
 * @param portId - port Id of port used to form connection
 * @param bundleTarget - only accepts direct port and direct superport
 */
export async function useCreatedBundle(
  chatId: string,
  portId: string,
  bundleTarget: BundleTarget,
  pairHash: string | null = null,
) {
  try {
    switch (bundleTarget) {
      case BundleTarget.direct:
        triggerNewChatStoreUpdate(chatId, portId);
        await direct.newChatOverGeneratedPortBundle(portId, chatId, pairHash);
        break;
      case BundleTarget.superportDirect:
        await superport.newChatOverCreatedSuperportBundle(
          portId,
          chatId,
          pairHash,
        );
        triggerNewChatStoreUpdate(chatId, portId);
        break;
      default:
        break;
    }
  } catch (error) {
    console.log('Error using created bundles: ', error);
  }
  triggerPendingRequestsReload();
}

/**
 * Use all read bundles
 */
export async function useReadBundles() {
  try {
    const readBundles = await storageReadPorts.getReadPorts();
    for (let index = 0; index < readBundles.length; index++) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      await useReadBundle(readBundles[index]);
    }
  } catch (error) {
    console.log('Error using read bundles: ', error);
  }
}
/**
 * Same as above function with nomenclature change because 'use' is a hook precursor
 */
export async function processReadBundles() {
  try {
    const readBundles = await storageReadPorts.getReadPorts();
    for (let index = 0; index < readBundles.length; index++) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      await useReadBundle(readBundles[index]);
    }
  } catch (error) {
    console.log('Error using read bundles: ', error);
  }
}

/**
 * Get a list of items to display on pending requests screen.
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
  triggerPendingRequestsReload();
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
