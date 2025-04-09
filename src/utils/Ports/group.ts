import * as API from './APICalls';
import * as storageReadPorts from '@utils/Storage/readPorts';
import * as storageGroupPorts from '@utils/Storage/groupPorts';
import {
  CURRENT_GROUPPORT_VERSION,
  IDEAL_UNUSED_PORTS_NUMBER,
  ORG_NAME,
  defaultFolderId,
} from '@configs/constants';
import {GroupBundle} from './interfaces';
import {ReadPortData} from '@utils/Storage/DBCalls/ports/readPorts';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';
import {GroupPortData} from '@utils/Storage/DBCalls/ports/groupPorts';
import {expiryOptionsTypes} from '@utils/Time/interfaces';
import Group from '@utils/Groups/Group';
import {
  generateISOTimeStamp,
  getExpiryTimestamp,
  hasExpired,
} from '@utils/Time';
import {BUNDLE_ID_PREPEND_LINK} from '@configs/api';
import {createChatPermissionsFromFolderId} from '@utils/Storage/permissions';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import {getGroupData} from '@utils/Storage/group';
import {readerInitialInfoSend} from '@utils/Groups/InitialInfoExchange';

/**
 * Fetches and stores unused ports for a particular group
 * @param groupId - group Id of group
 */
export async function getNewGroupPorts(groupId: string) {
  try {
    const portIds = await API.getNewGroupPorts(groupId);
    await storageGroupPorts.newGroupPorts(groupId, portIds);
  } catch (error) {
    console.log('Error getting new ports: ', error);
  }
}

/**
 * Gets an unused port for a particular group
 * @param groupId - group Id of group
 * @returns - port Id of unused port
 * @throws - error if we could not fetch an unused port.
 * The primary reason for this error would be a lack of an internet connection.
 */
async function getUnusedGroupPort(groupId: string): Promise<string> {
  const unusedPort = await storageGroupPorts.getUnusedGroupPort(groupId);
  if (
    !unusedPort.portId ||
    unusedPort.remainingPorts < IDEAL_UNUSED_PORTS_NUMBER
  ) {
    await getNewGroupPorts(groupId);
    if (!unusedPort.portId) {
      const newUnusedPort = await storageGroupPorts.getUnusedGroupPort(groupId);
      if (!newUnusedPort.portId) {
        throw new Error('NoAvailabeUnusedPort');
      }
      return newUnusedPort.portId;
    }
    return unusedPort.portId;
  }
  return unusedPort.portId;
}

/**
 * Fetches a generated group port's data
 * @param portId
 * @returns - generated data
 */
async function getGeneratedGroupPortData(
  portId: string,
): Promise<GroupPortData> {
  const portData = await storageGroupPorts.getGroupPortData(portId);
  if (!portData) {
    throw new Error('NoSuchGeneratedPort');
  }
  return portData;
}

/**
 * Creates a useable group port.
 * @param groupId - group Id of the group
 * @param expiry - port expiry (default is never);
 * @param channel - channel by which the port was shared
 * @param folderId - folder to which the formed connection should go to.
 * The connection will inherit the folder's permissions
 * @returns - bundle to display
 */
export async function generateNewGroupPortBundle(
  groupId: string,
  expiry: expiryOptionsTypes,
  channel: string | null,
  folderId: string,
): Promise<GroupBundle> {
  //get required params
  const groupData = await getGroupData(groupId);
  if (!groupData) {
    throw new Error('NoSuchGroup');
  }
  const portId = await getUnusedGroupPort(groupId);
  const version = CURRENT_GROUPPORT_VERSION;
  const name = groupData.name;
  const currentTimestamp = generateISOTimeStamp();
  const expiryTimestamp = getExpiryTimestamp(currentTimestamp, expiry);

  //update port with new info
  await storageGroupPorts.updateGroupPortData(portId, {
    version: version,
    usedOnTimestamp: currentTimestamp,
    expiryTimestamp: expiryTimestamp,
    folderId: folderId,
    channel: channel,
  });
  //generate bundle to display
  const displayBundle: GroupBundle = {
    portId: portId,
    version: version,
    org: ORG_NAME,
    target: BundleTarget.group,
    name: name,
    description: groupData.description,
  };
  return displayBundle;
}

/**
 * Accepts a group port bundle and stores it to use later.
 * @param portBundle
 * @param channel - channel via which the port bundle was accepted (null means QR)
 * @param folderId - folder to which the formed connection should move to.
 * @returns
 */
export async function acceptGroupPortBundle(
  portBundle: GroupBundle,
  channel: string | null = null,
  folderId: string = defaultFolderId,
) {
  //setup crypto
  const cryptoDriver = new CryptoDriver();
  await cryptoDriver.create();
  const cryptoId = cryptoDriver.getCryptoId();
  //save read port
  await storageReadPorts.newReadPort({
    portId: portBundle.portId,
    version: portBundle.version,
    target: portBundle.target,
    name: portBundle.name,
    description: portBundle.description,
    usedOnTimestamp: generateISOTimeStamp(),
    expiryTimestamp: portBundle.expiryTimestamp,
    channel: channel,
    folderId: folderId,
    cryptoId: cryptoId,
  });
  return portBundle.portId;
}

/**
 * Joins a group using a read group port
 * @param readPortBundle - read group port
 */
export async function newGroupChatOverReadPortBundle(
  readPortBundle: ReadPortData,
) {
  console.log('[Attempting to join group using read port]: ', readPortBundle);
  if (!readPortBundle.cryptoId) {
    throw new Error('NoCryptoId');
  }
  const cryptoId: string = readPortBundle.cryptoId;
  const chat = new Group();
  const cryptoDriver = new CryptoDriver(cryptoId);
  //check timestamp expiry
  if (hasExpired(readPortBundle.expiryTimestamp)) {
    //cleanup
    await storageReadPorts.deleteReadPortData(readPortBundle.portId);
    await cryptoDriver.deleteCryptoData();
    return;
  }
  //create chat permissions to be assigned to chat using folder Id
  const permissionsId = await createChatPermissionsFromFolderId(
    readPortBundle.folderId,
  );
  try {
    //join group
    await chat.joinGroup(
      readPortBundle.portId,
      {
        name: readPortBundle.name,
        amAdmin: false,
        description: readPortBundle.description,
        joinedAt: readPortBundle.usedOnTimestamp,
        permissionsId: permissionsId,
        selfCryptoId: cryptoId,
        disconnected: false,
        initialMemberInfoReceived: false,
      },
      readPortBundle.folderId,
    );
    await storageReadPorts.deleteReadPortData(readPortBundle.portId);
    console.log('[Sending initial set of messages]');
    const chatId = chat.getChatId();
    await readerInitialInfoSend(chatId);
  } catch (error: any) {
    console.log('error joining group: ', error);
    if (typeof error === 'object' && error.response) {
      if (error.response.status === 404) {
        console.log('Port has expired');
        //expire port
        storageReadPorts.expireReadPort(readPortBundle.portId);
      }
    }
  }
}

/**
 * Creates a generated group port into a clickable link and returns link.
 * If the clickable link is already generated, just returns the link without regenerating.
 * @param portId - group port Id
 * @param bundleString - bundle string to convert to link
 * @returns - clickable link
 */
export async function getGroupPortBundleClickableLink(
  portId: string,
  bundleString: string | null = null,
) {
  const generatedPort = await getGeneratedGroupPortData(portId);
  const currentChannel = generatedPort.channel;
  if (currentChannel) {
    const bundleId =
      currentChannel.substring(0, 7) === 'link://'
        ? currentChannel.replace('link://', '')
        : null;
    if (bundleId) {
      return BUNDLE_ID_PREPEND_LINK + bundleId;
    }
  }
  if (!bundleString) {
    throw new Error('NoBundleData');
  }
  const bundleId = await API.getBundleId(bundleString);
  await storageGroupPorts.updateGroupPortData(portId, {
    channel: 'link://' + bundleId,
  });
  return BUNDLE_ID_PREPEND_LINK + bundleId;
}

/**
 * clean deletes a generated group port
 * @param portId - group port to delete
 */
export async function cleanDeleteGeneratedGroupPort(portId: string) {
  try {
    const generatedPort = await getGeneratedGroupPortData(portId);
    await storageGroupPorts.deleteGroupPort(generatedPort.portId);
  } catch (error) {
    console.log('Error deleting generated port: ', error);
  }
}
