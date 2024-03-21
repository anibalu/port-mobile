import {
  DEFAULT_NAME,
  IDEAL_UNUSED_PORTS_NUMBER,
  defaultFolderId,
} from '@configs/constants';
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
import {createChatPermissionsFromFolderId} from '@utils/ChatPermissions';

/**
 * Fetches new unused ports and stores it in storage.
 */
export async function getNewPorts() {
  try {
    const portIds = await API.getNewPorts();
    await storageMyPorts.newPorts(portIds);
  } catch (error) {
    console.log('Error getting new ports: ', error);
  }
}

/**
 * Fetches an unused port.
 * This port needs to be updated with relevant crypto information to make it useable.
 * @returns - unused port Id
 */
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

/**
 * Port instrument version
 * @returns - version string
 */
function getCurrentPortVersion() {
  return '0.0.1';
}

/**
 * to determine legitimate ports
 * @returns - organisation identifier
 */
function getOrganisationName() {
  return 'numberless.tech';
}

/**
 * Fetches a generated port's data
 * @param portId
 * @returns - generated data
 */
async function getGeneratedPortData(portId: string): Promise<PortData> {
  const portData = await storageMyPorts.getPortData(portId);
  if (portData && portData.usedOnTimestamp) {
    const generatedPortData = {portId: portId, ...portData} as PortData;
    return generatedPortData;
  }
  throw new Error('NoSuchGeneratedPort');
}

/**
 * Fetches a read port's data
 * @param portId
 * @returns - read data
 */
async function getReadPortData(portId: string): Promise<ReadPortData> {
  const portData = await storageReadPorts.getReadPortData(portId);
  if (portData) {
    return portData;
  }
  throw new Error('NoSuchReadPort');
}

/**
 * Creates a useable port.
 * @param label - port label which is used as default contact name.
 * @param expiry - port expiry (default is never);
 * @param channel - channel by which the port was shared
 * @param folderId - folder to which the formed connection should go to.
 * The connection will inherit the folder's permissions
 * @returns - bundle to display
 */
export async function generateNewPortBundle(
  label: string,
  expiry: expiryOptionsTypes,
  channel: string | null = null,
  folderId: string = defaultFolderId,
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
    folderId: folderId,
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

/**
 * Fetches all generated ports. This information is displayed in the "pending ports" screen.
 * @returns - generated ports.
 */
export async function getAllGeneratedPorts(): Promise<PortData[]> {
  return await storageMyPorts.getUsedPorts();
}

/**
 * Update the label of a generated port
 * @param portId
 * @param label
 */
export async function updateGeneratedPortLabel(portId: string, label: string) {
  await storageMyPorts.updatePortData(portId, {label: label});
}

/**
 * Accepts a port bundle and stores it to use later.
 * @param portBundle
 * @param channel - channel via which the port bundle was accepted (null means QR)
 * @param folderId - folder to which the formed connection should move to.
 */
export async function acceptPortBundle(
  portBundle: PortBundle,
  channel: string | null = null,
  folderId: string = defaultFolderId,
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
    folderId: folderId,
  });
  //If accepted as share contact message bubble, update the message bubble accordingly.
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

/**
 * Create a new direct chat using a read port
 * @param readPortBundle - direct chat port bundle that is read.
 */
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
  //create chat permissions to be assigned to chat using folder Id
  const permissionsId = await createChatPermissionsFromFolderId(
    readPortBundle.folderId,
  );
  try {
    //try to create direct chat. If port is invalid, expire the port
    await chat.createChat(
      {
        name: readPortBundle.name,
        authenticated: false,
        disconnected: false,
        cryptoId: cryptoId,
        connectedOn: readPortBundle.usedOnTimestamp,
        connectedUsing: readPortBundle.channel,
        permissionsId: permissionsId,
      },
      readPortBundle.folderId,
      readPortBundle.portId,
      null,
      false,
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
  } catch (error: any) {
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
 * Create a new direct chat using a generated port and server assigned chat Id
 * @param portId - port id of generated port
 * @param chatId - chat Id assigned by the server
 */
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
  //create chat permissions to be assigned to chat using folder Id
  const permissionsId = await createChatPermissionsFromFolderId(
    generatedPort.folderId,
  );
  //create direct chat
  await chat.createChat(
    {
      name: generatedPort.label ? generatedPort.label : DEFAULT_NAME,
      authenticated: false,
      disconnected: false,
      cryptoId: cryptoId,
      connectedOn: generateISOTimeStamp(),
      connectedUsing: channel,
      permissionsId: permissionsId,
    },
    generatedPort.folderId,
    generatedPort.portId,
    chatId,
    false,
  );
  await storageMyPorts.deletePortData(generatedPort.portId);
  const sender = new SendMessage(chatId, ContentType.handshakeA1, {
    pubKey: await cryptoDriver.getPublicKey(),
  });
  await sender.send(true, false);
}

/**
 * Converts a generated bundle into a clickable link and returns link.
 * If the clickable link is already generated, just returns the link without regenerating.
 * @param portId
 * @param bundleString
 * @returns - clickable link
 */
export async function getPortBundleClickableLink(
  portId: string,
  bundleString: string | null = null,
): Promise<string> {
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

/**
 * Clean deletes all expired generated ports
 */
export async function cleanUpExpiredGeneratedPorts() {
  try {
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
  } catch (error) {
    console.log('Error cleaning up expired generated ports', error);
  }
}

/**
 * Clean deletes a read port
 * @param portId - port id of the read port
 */
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

/**
 * Clean deletes a generated port
 * @param portId - port id of generated port
 */
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
