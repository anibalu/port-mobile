import {BUNDLE_ID_PREPEND_LINK} from '@configs/api';
import {
  CURRENT_SUPERPORT_VERSION,
  DEFAULT_NAME,
  defaultFolderId,
  defaultSuperportConnectionsLimit,
} from '@configs/constants';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import DirectChat from '@utils/DirectChats/DirectChat';
import {ContentType} from '@utils/Messaging/interfaces';
import * as storageReadPorts from '@utils/Storage/readPorts';
import * as storageSuperports from '@utils/Storage/superPorts';
import {generateISOTimeStamp, hasExpired} from '@utils/Time';
import * as API from './APICalls';
import {
  BundleTarget,
  DirectSuperportBundle,
  ReadPortData,
  SuperportData,
} from './interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {createChatPermissionsFromFolderId} from '@utils/ChatPermissions';
import {getProfileName} from '@utils/Profile';

/**
 * Superport instrument version
 * @returns - version string
 */
function getCurrentSuperportVersion() {
  return CURRENT_SUPERPORT_VERSION;
}

/**
 * to determine legitimate ports
 * @returns - organisation identifier
 */
function getOrganisationName() {
  return 'numberless.tech';
}

/**
 * Creates a new superport
 * @param label - label of superport
 * @param connectionsLimit
 * @returns - bundle to display and superport data
 */
export async function createNewSuperport(
  label: string = '',
  connectionsLimit: number = defaultSuperportConnectionsLimit,
  folderId: string = defaultFolderId,
): Promise<{bundle: DirectSuperportBundle; superport: SuperportData}> {
  const portId = await API.getNewDirectSuperport();
  const cryptoDriver = new CryptoDriver();
  await cryptoDriver.create();
  const cryptoId = cryptoDriver.getCryptoId();
  const rad = await cryptoDriver.getRad();
  const keyHash = await cryptoDriver.getPublicKeyHash();
  const version = getCurrentSuperportVersion();
  const name = await getProfileName();
  //update superport
  await storageSuperports.newSuperport(portId);
  await storageSuperports.updateSuperportData(portId, {
    version: version,
    label: label,
    createdOnTimestamp: generateISOTimeStamp(),
    cryptoId: cryptoId,
    connectionsLimit: connectionsLimit,
    connectionsMade: 0,
    folderId: folderId,
    paused: false,
  });
  const createdSuperport = await getCreatedSuperportData(portId);
  //generate bundle to display
  const displayBundle: DirectSuperportBundle = {
    portId: portId,
    version: version,
    org: getOrganisationName(),
    target: BundleTarget.superportDirect,
    name: name,
    rad: rad,
    keyHash: keyHash,
  };
  return {bundle: displayBundle, superport: createdSuperport};
}

/**
 * Fetches data regarding a created superport
 * @param portId - superport port Id
 * @returns - bundle to display and superport data
 */
export async function fetchCreatedSuperportBundle(
  portId: string,
): Promise<{bundle: DirectSuperportBundle; superport: SuperportData}> {
  const createdSuperport = await getCreatedSuperportData(portId);
  const cryptoDriver = new CryptoDriver(createdSuperport.cryptoId);
  const rad = await cryptoDriver.getRad();
  const keyHash = await cryptoDriver.getPublicKeyHash();
  const version = getCurrentSuperportVersion();
  const displayBundle: DirectSuperportBundle = {
    portId: portId,
    version: version,
    org: getOrganisationName(),
    target: BundleTarget.superportDirect,
    name: await getProfileName(),
    rad: rad,
    keyHash: keyHash,
  };
  return {bundle: displayBundle, superport: createdSuperport};
}

/**
 * Fetch data associated with a created superport
 * @param portId
 * @returns - superport data
 */
async function getCreatedSuperportData(portId: string): Promise<SuperportData> {
  const portData = await storageSuperports.getSuperportData(portId);
  if (portData && portData.createdOnTimestamp) {
    const generatedPortData = {portId: portId, ...portData} as SuperportData;
    return generatedPortData;
  }
  throw new Error('NoSuchCreatedSuperport');
}

/**
 * Fetch all created superports
 * @returns - list of all created superports
 */
export async function getAllCreatedSuperports(): Promise<SuperportData[]> {
  return await storageSuperports.getAllSuperports();
}

/**
 * Update the label of a generated superport
 * @param portId
 * @param label
 */
export async function updateGeneratedSuperportLabel(
  portId: string,
  label: string,
) {
  await storageSuperports.updateSuperportData(portId, {label: label});
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
  await storageSuperports.updateSuperportData(portId, {
    connectionsLimit: newLimit,
  });
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
  await storageSuperports.updateSuperportData(portId, {folderId: folderId});
}

/**
 * Pause or unpause superport
 * @param portId
 * @param pause
 */
export async function changePausedStateOfSuperport(
  portId: string,
  pause: boolean,
) {
  if (pause) {
    storageSuperports.pauseSuperport(portId);
  } else {
    storageSuperports.unpauseSuperport(portId);
  }
}

/**
 * Read and accept a superport bundle
 * @param portBundle - superport bundle
 * @param channel - channel through which the superport was accessed
 * @param folderId - folder to which new chat should go to
 */
export async function acceptSuperportBundle(
  portBundle: DirectSuperportBundle,
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
    expiryTimestamp: null,
    channel: channel,
    cryptoId: cryptoId,
    folderId: folderId,
  });
}

/**
 * Create a new direct chat using a read superport
 * @param readPortBundle - direct chat superport bundle that is read
 */
export async function newChatOverReadSuperportBundle(
  readPortBundle: ReadPortData,
) {
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
    //try to create a direct chat
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
      true,
    );
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
 * Create a new direct chat using a generated superport and server assigned chat Id
 * @param portId - superport id of generated superport
 * @param chatId - chat Id assigned by the server
 */
export async function newChatOverCreatedSuperportBundle(
  portId: string,
  chatId: string,
  pairHash: string | null = null,
) {
  const createdSuperport: SuperportData = await getCreatedSuperportData(portId);
  if (!createdSuperport.cryptoId) {
    throw new Error('NoCryptoId');
  }
  const superportCryptoId: string = createdSuperport.cryptoId;
  const chat = new DirectChat();
  const superportCryptoDriver = new CryptoDriver(superportCryptoId);
  //check if superport is already paused
  if (createdSuperport.paused) {
    return;
  }
  //check if superport limit reached. If so, pause superport
  if (createdSuperport.connectionsMade === createdSuperport.connectionsLimit) {
    //pause superport
    await storageSuperports.pauseSuperport(createdSuperport.portId);
    return;
  }
  //create crypto duplicated entry
  const cryptoDriver = new CryptoDriver();
  await cryptoDriver.create(await superportCryptoDriver.getData());
  const cryptoId = cryptoDriver.getCryptoId();
  //create chat permissions to be assigned to chat using folder Id
  const permissionsId = await createChatPermissionsFromFolderId(
    createdSuperport.folderId,
  );
  //create direct chat
  await chat.createChat(
    {
      name: DEFAULT_NAME,
      authenticated: false,
      disconnected: false,
      cryptoId: cryptoId,
      connectedOn: generateISOTimeStamp(),
      connectedUsing: 'superport://' + createdSuperport.portId,
      permissionsId: permissionsId,
    },
    createdSuperport.folderId,
    createdSuperport.portId,
    chatId,
    true,
    pairHash,
  );
  //increase the count of connections made using this superport
  await storageSuperports.incrementConnectionsMade(
    createdSuperport.portId,
    generateISOTimeStamp(),
  );
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
export async function getSuperportBundleClickableLink(
  portId: string,
  bundleString: string | null = null,
) {
  const createdSuperport = await getCreatedSuperportData(portId);
  let currentChannel = createdSuperport.channel;
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
  const bundleId = await API.getBundleId(bundleString, true);
  await storageSuperports.updateSuperportData(portId, {
    channel: 'link://' + bundleId,
  });
  return BUNDLE_ID_PREPEND_LINK + bundleId;
}

/**
 * Clean delete a superport
 * @param portId - superport to delete
 */
export async function cleanDeleteSuperport(portId: string) {
  try {
    const createdSuperport = await getCreatedSuperportData(portId);
    await storageSuperports.deleteSuperPortData(createdSuperport.portId);
    if (createdSuperport.cryptoId) {
      const cryptoDriver = new CryptoDriver(createdSuperport.cryptoId);
      await cryptoDriver.deleteCryptoData();
    }
  } catch (error) {
    console.log('Error deleting generated port: ', error);
  }
}
