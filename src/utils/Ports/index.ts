import {expiryOptions, expiryOptionsTypes} from '@utils/Time/interfaces';
import {
  BundleTarget,
  BundleType,
  DirectSuperportBundle,
  GroupBundle,
  GroupSuperportBundle,
  PendingCardInfo,
  PortBundle,
  PortTable,
  ReadPortData,
  SuperportData,
} from './interfaces';
import {DEFAULT_NAME} from '@configs/constants';
import * as direct from './direct';
import * as group from './group';
import * as superport from './superport';
import * as storageReadPorts from '@utils/Storage/readPorts';
import store from '@store/appStore';

export async function fetchNewPorts(groupId: string | null = null) {
  if (!groupId) {
    await direct.getNewPorts();
  } else {
    await group.getNewGroupPorts(groupId);
  }
}

export function triggerPendingRequestsReload() {
  store.dispatch({
    type: 'TRIGGER_RELOAD',
  });
}

export function triggerNewChatStoreUpdate(chatId: string, portId: string) {
  store.dispatch({
    type: 'NEW_CONNECTION',
    payload: {
      chatId: chatId,
      connectionLinkId: portId,
    },
  });
}

export async function generateBundle<T extends BundleTarget>(
  type: T,
  id: string | null = null,
  label: string | null = DEFAULT_NAME,
  expiry: expiryOptionsTypes = expiryOptions[0],
  channel: string | null = null,
  presetId: string | null = null,
): Promise<BundleType<T>> {
  if (type === BundleTarget.direct) {
    if (!label) {
      throw new Error('LabelNull');
    }
    const newBundle = (await direct.generateNewPortBundle(
      label,
      expiry,
      channel,
      presetId,
    )) as BundleType<T>;
    triggerPendingRequestsReload();
    return newBundle;
  } else if (type === BundleTarget.group) {
    if (!id) {
      throw new Error('GroupIdNull');
    }
    const newBundle = (await group.generateNewGroupPortBundle(
      id,
      expiry,
    )) as BundleType<T>;
    return newBundle;
  } else {
    return {} as BundleType<T>;
  }
}

export async function fetchSuperport(
  superportId: string | null = null,
  label: string = 'unlabeled',
  connectionLimit: number | null = null,
): Promise<{bundle: DirectSuperportBundle; superport: SuperportData}> {
  if (superportId) {
    return await superport.fetchCreatedSuperportBundle(superportId);
  } else {
    return await superport.createNewSuperport(label, connectionLimit);
  }
}

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

export function checkBundleValidity(
  rawString: string,
): PortBundle | GroupBundle | DirectSuperportBundle | GroupSuperportBundle {
  const bundle = JSON.parse(rawString);
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

export async function readBundle(
  bundle:
    | PortBundle
    | GroupBundle
    | DirectSuperportBundle
    | GroupSuperportBundle,
  channel: string | null = null,
  presetId: string | null = null,
) {
  switch (bundle.target) {
    case BundleTarget.direct:
      await direct.acceptPortBundle(bundle as PortBundle, channel, presetId);
    case BundleTarget.group:
      await group.acceptGroupPortBundle(
        bundle as GroupBundle,
        channel,
        presetId,
      );
    case BundleTarget.superportDirect:
      await superport.acceptSuperportBundle(
        bundle as DirectSuperportBundle,
        channel,
        presetId,
      );
    default:
      break;
  }
  triggerPendingRequestsReload();
}

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
}

export async function useCreatedBundle(
  chatId: string,
  portId: string,
  bundleTarget: BundleTarget,
) {
  try {
    triggerNewChatStoreUpdate(chatId, portId);
    switch (bundleTarget) {
      case BundleTarget.direct:
        await direct.newChatOverGeneratedPortBundle(portId, chatId);
        break;
      case BundleTarget.superportDirect:
        await superport.newChatOverCreatedSuperportBundle(portId, chatId);
        break;
      default:
        break;
    }
  } catch (error) {
    console.log('Error using created bundle: ', error);
  }
  triggerPendingRequestsReload();
}

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
  triggerPendingRequestsReload();
}

function getReadPortChannelDescription(channel: string | null) {
  if (!channel) {
    return 'Scanned';
  } else if (channel === 'link') {
    return 'Clicked';
  } else {
    return 'Shared';
  }
}

export async function getPendingRequests(): Promise<PendingCardInfo[]> {
  const pendingRequests: PendingCardInfo[] = [];
  //generated ports
  const generatedPorts = await direct.getAllGeneratedPorts();

  const morphedGeneratedPorts = generatedPorts.map(port => {
    const channelDesc = port.channel ? 'Shared' : 'Initiated';
    const pendingRequest: PendingCardInfo = {
      portId: port.portId,
      name: port.label ? port.label : 'New Contact',
      target: BundleTarget.direct,
      usedOnTimestamp: port.usedOnTimestamp,
      expiryTimestamp: port.expiryTimestamp,
      stage: 'Pending Handshake',
      channelDescription: channelDesc,
      table: PortTable.generated,
    };
    return pendingRequest;
  });
  pendingRequests.push(...morphedGeneratedPorts);
  //read ports
  const readPorts = await storageReadPorts.getReadPorts();
  const morphedReadPorts = readPorts.map(port => {
    const pendingRequest: PendingCardInfo = {
      portId: port.portId,
      name: port.name,
      target: port.target,
      usedOnTimestamp: port.usedOnTimestamp,
      expiryTimestamp: port.expiryTimestamp,
      stage: 'Pending Handshake',
      channelDescription: getReadPortChannelDescription(port.channel),
      table: PortTable.read,
    };
    return pendingRequest;
  });
  pendingRequests.push(...morphedReadPorts);
  pendingRequests.sort((a, b) => {
    let dateA = new Date(a.usedOnTimestamp);
    let dateB = new Date(b.usedOnTimestamp);
    if (isNaN(dateA.getTime())) {
      // Handle invalid dateA (perhaps by sorting it to the end)
      return 1;
    }
    if (isNaN(dateB.getTime())) {
      // Handle invalid dateB (perhaps by sorting it to the beginning)
      return -1;
    }
    return dateB.getTime() - dateA.getTime();
  });
  return pendingRequests;
}

export async function numberOfPendingRequests() {
  //generated ports
  const generatedPorts = await direct.getAllGeneratedPorts();
  //read ports
  const readPorts = await storageReadPorts.getReadPorts();
  return generatedPorts.length + readPorts.length;
}

export async function getAllCreatedSuperports(): Promise<SuperportData[]> {
  return await superport.getAllCreatedSuperports();
}

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

export async function cleanUpPorts() {
  await direct.cleanUpExpiredGeneratedPorts();
  await superport.cleanUsedUpSuperports();
}

export async function getReadPort(
  portId: string,
): Promise<ReadPortData | null> {
  return await storageReadPorts.getReadPortData(portId);
}
