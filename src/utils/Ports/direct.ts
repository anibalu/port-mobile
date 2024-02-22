import {DEFAULT_NAME, IDEAL_UNUSED_PORTS_NUMBER} from '@configs/constants';
import * as API from './APICalls';
import * as storageMyPorts from '@utils/Storage/myPorts';
import * as storageReadPorts from '@utils/Storage/readPorts';
import {BundleTarget, PortBundle, PortData, ReadPortData} from './interfaces';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import {getProfileName} from '@utils/Profile';
import {
  hasExpired,
  generateISOTimeStamp,
  getExpiryTimestamp,
} from '@utils/Time';
import {expiryOptionsTypes} from '@utils/Time/interfaces';
import DirectChat from '@utils/DirectChats/DirectChat';
import {ContactBundleParams, ContentType} from '@utils/Messaging/interfaces';
import {BUNDLE_ID_PREPEND_LINK} from '@configs/api';
import {getMessage, updateMessage} from '@utils/Storage/messages';
import SendMessage from '@utils/Messaging/Send/SendMessage';

export async function getNewPorts() {
  try {
    const portIds = await API.getNewPorts();
    await storageMyPorts.newPorts(portIds);
  } catch (error) {
    console.log('Error getting new ports: ', error);
  }
}

async function getUnusedPort(): Promise<string> {
  const unusedPort = await storageMyPorts.getUnusedPort();
  if (
    !unusedPort.portId ||
    unusedPort.remainingPorts < IDEAL_UNUSED_PORTS_NUMBER
  ) {
    await getNewPorts();
    if (!unusedPort.portId) {
      const newUnusedPort = await storageMyPorts.getUnusedPort();
      if (!newUnusedPort.portId) {
        throw new Error('NoAvailabeUnusedPort');
      }
      return newUnusedPort.portId;
    }
    return unusedPort.portId;
  }
  return unusedPort.portId;
}

function getCurrentPortVersion() {
  return '0.0.1';
}
function getOrganisationName() {
  return 'numberless.tech';
}

async function getGeneratedPortData(portId: string): Promise<PortData> {
  const portData = await storageMyPorts.getPortData(portId);
  if (portData && portData.usedOnTimestamp) {
    const generatedPortData = {portId: portId, ...portData} as PortData;
    return generatedPortData;
  }
  throw new Error('NoSuchGeneratedPort');
}

async function getReadPortData(portId: string): Promise<ReadPortData> {
  const portData = await storageReadPorts.getReadPortData(portId);
  if (portData) {
    return portData;
  }
  throw new Error('NoSuchReadPort');
}

export async function generateNewPortBundle(
  label: string,
  expiry: expiryOptionsTypes,
  channel: string | null = null,
  presetId: string | null = null,
): Promise<PortBundle> {
  //get required params
  const portId = await getUnusedPort();
  const cryptoDriver = new CryptoDriver();
  await cryptoDriver.create();
  const cryptoId = cryptoDriver.getCryptoId();
  const rad = await cryptoDriver.getRad();
  const keyHash = await cryptoDriver.getPublicKeyHash();
  const version = getCurrentPortVersion();
  const name = await getProfileName();
  const currentTimestamp = generateISOTimeStamp();
  const expiryTimestamp = getExpiryTimestamp(currentTimestamp, expiry);
  //update port with new info
  await storageMyPorts.updatePortData(portId, {
    version: version,
    label: label,
    usedOnTimestamp: currentTimestamp,
    expiryTimestamp: expiryTimestamp,
    cryptoId: cryptoId,
    channel: channel,
    permissionPresetId: presetId,
  });
  //generate bundle to display
  const displayBundle: PortBundle = {
    portId: portId,
    version: version,
    org: getOrganisationName(),
    target: BundleTarget.direct,
    name: name,
    expiryTimestamp: expiryTimestamp,
    rad: rad,
    keyHash: keyHash,
  };
  return displayBundle;
}

export async function getAllGeneratedPorts(): Promise<PortData[]> {
  return await storageMyPorts.getUsedPorts();
}

export async function acceptPortBundle(
  portBundle: PortBundle,
  channel: string | null = null,
  presetId: string | null = null,
) {
  //setup crypto
  const cryptoDriver = new CryptoDriver();
  await cryptoDriver.create();
  await cryptoDriver.updatePeerPublicKeyHashAndRad(
    portBundle.keyHash,
    portBundle.rad,
  );
  const cryptoId = cryptoDriver.getCryptoId();
  //save read port
  await storageReadPorts.newReadPort({
    portId: portBundle.portId,
    version: portBundle.version,
    target: portBundle.target,
    name: portBundle.name,
    usedOnTimestamp: generateISOTimeStamp(),
    expiryTimestamp: portBundle.expiryTimestamp,
    channel: channel,
    cryptoId: cryptoId,
    permissionPresetId: presetId,
  });
  if (channel) {
    if (channel.substring(0, 9) === 'shared://') {
      const fromChatId = channel.substring(9, 9 + 32);
      const messsageId = channel.substring(9 + 32 + 3, 9 + 32 + 3 + 32);
      const message = await getMessage(fromChatId, messsageId);
      if (message) {
        const update = message.data as ContactBundleParams;
        update.accepted = true;
        await updateMessage(fromChatId, messsageId, update);
      }
    }
  }
}

export async function newChatOverReadPortBundle(readPortBundle: ReadPortData) {
  if (!readPortBundle.cryptoId) {
    throw new Error('NoCryptoId');
  }
  const cryptoId: string = readPortBundle.cryptoId;
  const chat = new DirectChat();
  const cryptoDriver = new CryptoDriver(cryptoId);
  //check timestamp expiry
  if (hasExpired(readPortBundle.expiryTimestamp)) {
    //cleanup
    await storageReadPorts.deleteReadPortData(readPortBundle.portId);
    await cryptoDriver.deleteCryptoData();
    return;
  }
  //create direct chat
  await chat.createChat(
    {
      name: readPortBundle.name,
      authenticated: false,
      disconnected: false,
      cryptoId: cryptoId,
      connectedOn: readPortBundle.usedOnTimestamp,
    },
    readPortBundle.portId,
    null,
    false,
    readPortBundle.permissionPresetId
      ? readPortBundle.permissionPresetId
      : null,
  );
  if (readPortBundle.channel) {
    const channel = readPortBundle.channel;
    if (channel.substring(0, 9) === 'shared://') {
      const fromChatId = channel.substring(9, 9 + 32);
      const messsageId = channel.substring(9 + 32 + 3, 9 + 32 + 3 + 32);
      const message = await getMessage(fromChatId, messsageId);
      if (message) {
        const update = message.data as ContactBundleParams;
        (update.accepted = true), (update.goToChatId = chat.getChatId());
        await updateMessage(fromChatId, messsageId, update);
      }
    }
  }
  await storageReadPorts.deleteReadPortData(readPortBundle.portId);
}

export async function newChatOverGeneratedPortBundle(
  portId: string,
  chatId: string,
) {
  const generatedPort: PortData = await getGeneratedPortData(portId);
  if (!generatedPort.cryptoId) {
    throw new Error('NoCryptoId');
  }
  const cryptoId: string = generatedPort.cryptoId;
  const chat = new DirectChat();
  const cryptoDriver = new CryptoDriver(cryptoId);
  //check timestamp expiry
  if (hasExpired(generatedPort.expiryTimestamp)) {
    //cleanup
    await storageMyPorts.deletePortData(generatedPort.portId);
    await cryptoDriver.deleteCryptoData();
    return;
  }
  const channel = generatedPort.channel;
  //create direct chat
  await chat.createChat(
    {
      name: generatedPort.label ? generatedPort.label : DEFAULT_NAME,
      authenticated: false,
      disconnected: false,
      cryptoId: cryptoId,
      connectedOn: generateISOTimeStamp(),
    },
    generatedPort.portId,
    chatId,
    false,
    generatedPort.permissionPresetId ? generatedPort.permissionPresetId : null,
    channel,
  );
  await storageMyPorts.deletePortData(generatedPort.portId);
  const sender = new SendMessage(chatId, ContentType.handshakeA1, {
    pubKey: await cryptoDriver.getPublicKey(),
  });
  await sender.send(true, false);
}

export async function getPortBundleClickableLink(
  portId: string,
  bundleString: string | null = null,
) {
  const generatedPort = await getGeneratedPortData(portId);
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
  await storageMyPorts.updatePortData(portId, {channel: 'link://' + bundleId});
  return BUNDLE_ID_PREPEND_LINK + bundleId;
}

export async function cleanUpExpiredGeneratedPorts() {
  const generatedPorts = await getAllGeneratedPorts();
  for (let index = 0; index < generatedPorts.length; index++) {
    if (hasExpired(generatedPorts[index].expiryTimestamp)) {
      await storageMyPorts.deletePortData(generatedPorts[index].portId);
      if (generatedPorts[index].cryptoId) {
        const cryptoDriver = new CryptoDriver(generatedPorts[index].cryptoId);
        await cryptoDriver.deleteCryptoData();
      }
    }
  }
}

export async function cleanDeleteReadPort(portId: string) {
  try {
    const readPort = await getReadPortData(portId);
    await storageReadPorts.deleteReadPortData(readPort.portId);
    if (readPort.cryptoId) {
      const cryptoDriver = new CryptoDriver(readPort.cryptoId);
      await cryptoDriver.deleteCryptoData();
    }
  } catch (error) {
    console.log('Error deleting read port: ', error);
  }
}

export async function cleanDeleteGeneratedPort(portId: string) {
  try {
    const generatedPort = await getGeneratedPortData(portId);
    await storageMyPorts.deletePortData(generatedPort.portId);
    if (generatedPort.cryptoId) {
      const cryptoDriver = new CryptoDriver(generatedPort.cryptoId);
      await cryptoDriver.deleteCryptoData();
    }
  } catch (error) {
    console.log('Error deleting generated port: ', error);
  }
}
