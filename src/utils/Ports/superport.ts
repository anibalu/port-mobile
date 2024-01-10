import {BUNDLE_ID_PREPEND_LINK} from '@configs/api';
import {DEFAULT_NAME} from '@configs/constants';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import DirectChat from '@utils/DirectChats/DirectChat';
import SendMessage from '@utils/Messaging/Send/SendMessage';
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

function getCurrentSuperportVersion() {
  return '0.0.1';
}
function getOrganisationName() {
  return 'numberless.tech';
}

export async function createNewSuperport(
  label: string = 'unlabeled',
  connectionLimit: number | null,
): Promise<{bundle: DirectSuperportBundle; superport: SuperportData}> {
  const portId = await API.getNewDirectSuperport();
  const cryptoDriver = new CryptoDriver();
  await cryptoDriver.create();
  const cryptoId = cryptoDriver.getCryptoId();
  const rad = await cryptoDriver.getRad();
  const keyHash = await cryptoDriver.getPublicKeyHash();
  const version = getCurrentSuperportVersion();
  const name = label;
  //update superport
  await storageSuperports.newSuperport(portId);
  await storageSuperports.updateSuperportData(portId, {
    version: version,
    label: label,
    createdOnTimestamp: generateISOTimeStamp(),
    cryptoId: cryptoId,
    connectionsPossible: connectionLimit,
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
    name: createdSuperport.label ? createdSuperport.label : 'unlabeled',
    rad: rad,
    keyHash: keyHash,
  };
  return {bundle: displayBundle, superport: createdSuperport};
}

async function getCreatedSuperportData(portId: string): Promise<SuperportData> {
  const portData = await storageSuperports.getSuperportData(portId);
  if (portData && portData.createdOnTimestamp) {
    const generatedPortData = {portId: portId, ...portData} as SuperportData;
    return generatedPortData;
  }
  throw new Error('NoSuchCreatedSuperport');
}

export async function getAllCreatedSuperports(): Promise<SuperportData[]> {
  return await storageSuperports.getAllSuperports();
}

export async function acceptSuperportBundle(
  portBundle: DirectSuperportBundle,
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
    expiryTimestamp: null,
    channel: channel,
    cryptoId: cryptoId,
    permissionPresetId: presetId,
  });
}

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
    true,
    readPortBundle.permissionPresetId
      ? readPortBundle.permissionPresetId
      : null,
  );
  await storageReadPorts.deleteReadPortData(readPortBundle.portId);
}

export async function newChatOverCreatedSuperportBundle(
  portId: string,
  chatId: string,
) {
  const createdSuperport: SuperportData = await getCreatedSuperportData(portId);
  if (!createdSuperport.cryptoId) {
    throw new Error('NoCryptoId');
  }

  const superportCryptoId: string = createdSuperport.cryptoId;
  const chat = new DirectChat();
  const superportCryptoDriver = new CryptoDriver(superportCryptoId);
  //check timestamp expiry
  if (createdSuperport.connectionsPossible === 0) {
    //cleanup
    await storageSuperports.deleteSuperPortData(createdSuperport.portId);
    await superportCryptoDriver.deleteCryptoData();
    return;
  }
  //create crypto duplicated entry
  const cryptoDriver = new CryptoDriver();
  await cryptoDriver.create(await superportCryptoDriver.getData());
  const cryptoId = cryptoDriver.getCryptoId();
  //create direct chat
  await chat.createChat(
    {
      name: createdSuperport.label
        ? DEFAULT_NAME + 'via' + createdSuperport.label
        : DEFAULT_NAME + 'via superport',
      authenticated: false,
      disconnected: false,
      cryptoId: cryptoId,
      connectedOn: generateISOTimeStamp(),
    },
    createdSuperport.portId,
    chatId,
    true,
  );
  await storageSuperports.decrementConnectionsPossible(portId);
  const sender = new SendMessage(chatId, ContentType.handshakeA1, {
    pubKey: await cryptoDriver.getPublicKey(),
  });
  await sender.send(true, false);
}

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

export async function cleanUsedUpSuperports() {
  const createdSuperports = await getAllCreatedSuperports();
  for (let index = 0; index < createdSuperports.length; index++) {
    if (createdSuperports[index].connectionsPossible === 0) {
      await storageSuperports.deleteSuperPortData(
        createdSuperports[index].portId,
      );
      if (createdSuperports[index].cryptoId) {
        const cryptoDriver = new CryptoDriver(
          createdSuperports[index].cryptoId,
        );
        await cryptoDriver.deleteCryptoData();
      }
    }
  }
}
