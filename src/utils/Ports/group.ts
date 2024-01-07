import * as API from './APICalls';
import * as storageReadPorts from '@utils/Storage/readPorts';
import * as storageGroupPorts from '@utils/Storage/groupPorts';
import {IDEAL_UNUSED_PORTS_NUMBER} from '@configs/constants';
import {
  BundleTarget,
  GroupBundle,
  GroupPortData,
  ReadPortData,
} from './interfaces';
import {expiryOptionsTypes} from '@utils/Time/interfaces';
import Group from '@utils/Groups/Group';
import {
  generateISOTimeStamp,
  getExpiryTimestamp,
  hasExpired,
} from '@utils/Time';
import {BUNDLE_ID_PREPEND_LINK} from '@configs/api';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType} from '@utils/Messaging/interfaces';
import {getProfileName} from '@utils/Profile';

export async function getNewGroupPorts(groupId: string) {
  try {
    const portIds = await API.getNewGroupPorts(groupId);
    await storageGroupPorts.newGroupPorts(groupId, portIds);
  } catch (error) {
    console.log('Error getting new ports: ', error);
  }
}

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

function getCurrentGroupportVersion() {
  return '0.0.1';
}
function getOrganisationName() {
  return 'numberless.tech';
}

async function getGeneratedGroupPortData(
  portId: string,
): Promise<GroupPortData> {
  const portData = await storageGroupPorts.getGroupPortData(portId);
  if (portData && portData.usedOnTimestamp) {
    const generatedPortData = {portId: portId, ...portData} as GroupPortData;
    return generatedPortData;
  }
  throw new Error('NoSuchGeneratedPort');
}

export async function generateNewGroupPortBundle(
  groupId: string,
  expiry: expiryOptionsTypes,
): Promise<GroupBundle> {
  //get required params
  const group = new Group(groupId);
  const groupData = await group.getData();
  if (!groupData) {
    throw new Error('NoSuchGroup');
  }
  const portId = await getUnusedGroupPort(groupId);
  const version = getCurrentGroupportVersion();
  const name = groupData.name;
  const currentTimestamp = generateISOTimeStamp();
  const expiryTimestamp = getExpiryTimestamp(currentTimestamp, expiry);

  //update port with new info
  await storageGroupPorts.updateGroupPortData(portId, {
    version: version,
    usedOnTimestamp: currentTimestamp,
    expiryTimestamp: expiryTimestamp,
  });
  //generate bundle to display
  const displayBundle: GroupBundle = {
    portId: portId,
    version: version,
    org: getOrganisationName(),
    target: BundleTarget.group,
    name: name,
    description: groupData.description,
    expiryTimestamp: expiryTimestamp,
  };
  return displayBundle;
}

export async function acceptGroupPortBundle(
  portBundle: GroupBundle,
  channel: string | null = null,
  presetId: string | null = null,
) {
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
    permissionPresetId: presetId,
  });
  return portBundle.portId;
}

export async function newGroupChatOverReadPortBundle(
  readPortBundle: ReadPortData,
) {
  const chat = new Group();
  //check timestamp expiry
  if (hasExpired(readPortBundle.expiryTimestamp)) {
    //cleanup
    await storageReadPorts.deleteReadPortData(readPortBundle.portId);
    return;
  }
  //join group
  await chat.joinGroup(
    readPortBundle.portId,
    {
      name: readPortBundle.name,
      amAdmin: false,
      description: readPortBundle.description,
      joinedAt: readPortBundle.usedOnTimestamp,
    },
    readPortBundle.permissionPresetId
      ? readPortBundle.permissionPresetId
      : null,
  );
  await storageReadPorts.deleteReadPortData(readPortBundle.portId);
  try {
    const myName = await getProfileName();
    const sender = new SendMessage(chat.getGroupIdNotNull(), ContentType.name, {
      name: myName,
    });
    await sender.send();
  } catch (error) {
    console.log('Error sending name to group:', error);
  }
}

export async function getGroupPortBundleClickableLink(
  portId: string,
  bundleString: string | null = null,
) {
  const generatedPort = await getGeneratedGroupPortData(portId);
  let currentChannel = generatedPort.channel;
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

export async function cleanDeleteGeneratedGroupPort(portId: string) {
  try {
    const generatedPort = await getGeneratedGroupPortData(portId);
    await storageGroupPorts.deleteGroupPort(generatedPort.portId);
  } catch (error) {
    console.log('Error deleting generated port: ', error);
  }
}
