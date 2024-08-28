import {
  CURRENT_PORT_VERSION,
  DEFAULT_NAME,
  IDEAL_UNUSED_PORTS_NUMBER,
  ORG_NAME,
} from '@configs/constants';
import * as API from './APICalls';
import * as storageMyPorts from '@utils/Storage/myPorts';
import * as storageReadPorts from '@utils/Storage/readPorts';
import {PortBundle} from './interfaces';
import {ReadPortData} from '@utils/Storage/DBCalls/ports/readPorts';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';
import {PortData} from '@utils/Storage/DBCalls/ports/myPorts';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import {getProfileName} from '@utils/Profile';
import {
  hasExpired,
  generateISOTimeStamp,
  getExpiryTimestamp,
} from '@utils/Time';
import {expiryOptionsTypes} from '@utils/Time/interfaces';
import DirectChat, {IntroMessage} from '@utils/DirectChats/DirectChat';
import {ContactBundleParams} from '@utils/Messaging/interfaces';
import {BUNDLE_ID_PREPEND_LINK} from '@configs/api';
import {getMessage, updateMessageData} from '@utils/Storage/messages';
import {
  clearPermissions,
  createChatPermissionsFromFolderId,
} from '@utils/Storage/permissions';
import {checkLineExists} from '@utils/Storage/lines';
import {
  generatorInitialInfoSend,
  readerInitialInfoSend,
} from '@utils/DirectChats/initialInfoExchange';

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
 * Fetches a generated port's data
 * @param portId
 * @returns - generated data
 */
export async function getGeneratedPortData(portId: string): Promise<PortData> {
  const portData = await storageMyPorts.getPortData(portId);
  if (!portData) {
    throw new Error('NoUsedPortFound');
  }
  return portData;
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
  channel: string | null,
  folderId: string,
): Promise<PortBundle> {
  //get required params
  const portId = await getUnusedPort();
  const cryptoDriver = new CryptoDriver();
  await cryptoDriver.create();
  const cryptoId = cryptoDriver.getCryptoId();
  const rad = await cryptoDriver.getRad();
  const keyHash = await cryptoDriver.getPublicKeyHash();
  const pubkey = await cryptoDriver.getPublicKey();
  const version = CURRENT_PORT_VERSION;
  const name = await getProfileName();
  const currentTimestamp = generateISOTimeStamp();
  const expiryTimestamp = getExpiryTimestamp(currentTimestamp, expiry);
  const permissionsId = await createChatPermissionsFromFolderId(folderId);
  //update port with new info
  await storageMyPorts.updatePortData(portId, {
    version: version,
    label: label,
    usedOnTimestamp: currentTimestamp,
    expiryTimestamp: expiryTimestamp,
    cryptoId: cryptoId,
    channel: channel,
    folderId: folderId,
    permissionsId: permissionsId,
  });
  //generate bundle to display
  const displayBundle: PortBundle = {
    portId,
    version,
    org: ORG_NAME,
    target: BundleTarget.direct,
    name,
    rad,
    keyHash,
    pubkey,
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
  channel: string | null,
  folderId: string,
) {
  //setup crypto
  const cryptoDriver = new CryptoDriver();
  await cryptoDriver.create();
  await cryptoDriver.updatePeerPublicKeyHashAndRad(
    portBundle.keyHash,
    portBundle.rad,
  );
  if (portBundle.pubkey) {
    // compute shared secret immediately if peer has readily shared their pubkey
    cryptoDriver.updateSharedSecret(portBundle.pubkey);
  }
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
        await updateMessageData(fromChatId, messsageId, update);
      }
    }
  }
}

/**
 * Create a new direct chat using a read port
 * @param readPortBundle - direct chat port bundle that is read.
 */
export async function newChatOverReadPortBundle(readPortBundle: ReadPortData) {
  console.log('[Attempting to form chat using read port]: ', readPortBundle);
  if (!readPortBundle.cryptoId) {
    throw new Error('NoCryptoId');
  }
  const cryptoId: string = readPortBundle.cryptoId;
  const chat = new DirectChat();
  const cryptoDriver = new CryptoDriver(cryptoId);
  //check timestamp expiry.
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
    await chat.createChatUsingPortId(
      readPortBundle.portId,
      {
        name: readPortBundle.name,
        authenticated: false,
        disconnected: false,
        cryptoId: cryptoId,
        connectedOn: readPortBundle.usedOnTimestamp,
        connectionSource: readPortBundle.channel,
        permissionsId: permissionsId,
      },
      readPortBundle.folderId,
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
          (update.accepted = true), (update.createdChatId = chat.getChatId());
          await updateMessageData(fromChatId, messsageId, update);
        }
      }
    }
    console.log('[Deleting read port on successful chat formation]');
    await storageReadPorts.deleteReadPortData(readPortBundle.portId);
    console.log('[Sending initial set of messages]');
    const chatId = chat.getChatId();
    await readerInitialInfoSend(chatId);
  } catch (error: any) {
    //delete permissions if there is an error.
    await clearPermissions(permissionsId);
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
 * @param lineId - chat Id assigned by the server
 */
export async function newChatOverGeneratedPortBundle(
  portId: string,
  lineId: string,
  pairHash: string,
  introMessage: IntroMessage,
) {
  console.log(
    '[Attempting to form chat using lineId and pairHash]: ',
    lineId,
    pairHash,
  );
  //if chat is already formed, this guard prevents retrying new chat over generated port.
  const chatExists = await checkLineExists(lineId);
  if (chatExists) {
    throw new Error('Attempted to retry new chat over generated port bundle');
  }
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
    if (generatedPort.permissionsId) {
      await clearPermissions(generatedPort.permissionsId);
    }
    return;
  }
  const channel = generatedPort.channel;
  //create chat permissions to be assigned to chat using folder Id
  const permissionsId =
    generatedPort.permissionsId ||
    (await createChatPermissionsFromFolderId(generatedPort.folderId));
  //create direct chat
  await chat.createChatUsingLineId(
    lineId,
    portId,
    {
      name: generatedPort.label ? generatedPort.label : DEFAULT_NAME,
      authenticated: false,
      disconnected: false,
      cryptoId: cryptoId,
      connectedOn: generateISOTimeStamp(),
      connectionSource: channel,
      permissionsId: permissionsId,
    },
    introMessage,
    pairHash,
    generatedPort.folderId,
  );
  console.log(
    '[Deleting generated port on successfully forming/rejecting a chat]',
  );
  await storageMyPorts.deletePortData(generatedPort.portId);
  const chatId = chat.getChatId();
  generatorInitialInfoSend(chatId);
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
    const readPort = await storageReadPorts.getReadPortData(portId);
    if (!readPort) {
      throw new Error('NoSuchReadPort');
    }
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
