import {ContactPortData} from '@utils/Storage/DBCalls/ports/contactPorts';
import * as API from './APICalls';
import {checkLineExists} from '@utils/Storage/lines';
import {createChatPermissionsFromFolderId} from '@utils/Storage/permissions';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import {
  CURRENT_CONTACTPORT_VERSION,
  DEFAULT_NAME,
  defaultFolderId,
  ORG_NAME,
} from '@configs/constants';
import * as storageContactPorts from '@utils/Storage/contactPorts';
import {generateISOTimeStamp, hasExpired} from '@utils/Time';
import {DirectContactPortBundle} from './interfaces';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';
import * as storageReadPorts from '@utils/Storage/readPorts';
import {getProfileName} from '@utils/Profile';
import DirectChat, {IntroMessage} from '@utils/DirectChats/DirectChat';
import {getChatIdFromPairHash, getConnection} from '@utils/Storage/connections';
import {
  generatorInitialInfoSend,
  readerInitialInfoSend,
} from '@utils/DirectChats/initialInfoExchange';
import {ReadPortData} from '@utils/Storage/DBCalls/ports/readPorts';
import {generateRandomHexId} from '@utils/IdGenerator';
import {
  ContactBundleParams,
  ContactPortTicketParams,
  ContentType,
  PayloadMessageParams,
} from '@utils/Messaging/interfaces';
import {BUNDLE_ID_PREPEND_LINK} from '@configs/api';
import {getMessage, updateMessageData} from '@utils/Storage/messages';

/**
 * Fetch a contact port bundle. If no contact port exists, create one.
 * @param pairHash - pairHash of the chat
 * @param folderId - optional folder Id that the formed chat needs to go to.
 * @returns - contact port bundle.
 */
export async function fetchContactPortBundle(
  pairHash: string,
  folderId: string = defaultFolderId,
): Promise<DirectContactPortBundle> {
  const storedContactPort =
    await storageContactPorts.getContactPortDataFromPairHash(pairHash);
  const name = await getProfileName();
  //If there is a stored contact port, return its bundle.
  if (storedContactPort) {
    const cryptoDriver = new CryptoDriver(storedContactPort.cryptoId);
    const rad = await cryptoDriver.getRad();
    const keyHash = await cryptoDriver.getPublicKeyHash();
    const pubKey = await cryptoDriver.getPublicKey();
    const version = CURRENT_CONTACTPORT_VERSION;
    const bundle: DirectContactPortBundle = {
      portId: storedContactPort.portId,
      version,
      org: ORG_NAME,
      target: BundleTarget.contactPort,
      name,
      rad,
      keyHash,
      pubkey: pubKey,
    };
    return bundle;
  }
  //Else, create a new contact port and return its bundle
  const chatId = await getChatIdFromPairHash(pairHash);
  if (!chatId) {
    throw new Error('No chat associated with pairHash');
  }
  const chat = new DirectChat(chatId);
  const chatData = await chat.getChatData();
  if (chatData.disconnected || !chatData.authenticated) {
    throw new Error('Chat is disconnected or unauthenticated');
  }
  const permissions = await chat.getPermissions();
  const contactPortId = await API.getNewContactPort(
    chatData.lineId,
    permissions.contactSharing,
  );
  const cryptoDriver = new CryptoDriver();
  await cryptoDriver.create();
  const cryptoId = cryptoDriver.getCryptoId();
  const rad = await cryptoDriver.getRad();
  const keyHash = await cryptoDriver.getPublicKeyHash();
  const pubKey = await cryptoDriver.getPublicKey();
  const version = CURRENT_CONTACTPORT_VERSION;
  await storageContactPorts.addContactPort({
    portId: contactPortId,
    pairHash: pairHash,
    owner: true,
    version: version,
    createdOnTimestamp: generateISOTimeStamp(),
    cryptoId: cryptoId,
    connectionsMade: 0,
    folderId: folderId,
    paused: permissions.contactSharing,
  });
  const bundle: DirectContactPortBundle = {
    portId: contactPortId,
    version,
    org: ORG_NAME,
    target: BundleTarget.contactPort,
    name,
    rad,
    keyHash,
    pubkey: pubKey,
  };
  return bundle;
}

/**
 * Creates a shareable bundle from an authorized contact port
 * @param pairHash - pairHash of the contact
 * @returns - shareable bundle.
 */
export async function convertAuthorizedContactPortToShareablePort(
  pairHash: string,
): Promise<DirectContactPortBundle> {
  const authorizedContactPort =
    await storageContactPorts.getAcceptedContactPortDataFromPairHash(pairHash);
  if (!authorizedContactPort) {
    throw new Error('NoAuthorizedContactPort');
  }
  const chatId = await getChatIdFromPairHash(pairHash);
  if (!chatId) {
    throw new Error('NoValidChat');
  }
  console.log('authorized contact port: ', authorizedContactPort);
  const ticket = generateRandomHexId();
  const contactPortId = authorizedContactPort.portId;
  const ticketParams: ContactPortTicketParams = {
    ticketId: ticket,
    contactPortId: contactPortId,
  };
  const payload: PayloadMessageParams = {
    messageId: generateRandomHexId(),
    contentType: ContentType.contactPortTicket,
    data: ticketParams,
  };
  const plaintext = JSON.stringify(payload);
  const chat = new DirectChat(chatId);
  const chatData = await chat.getChatData();
  const cryptoDriver = new CryptoDriver(chatData.cryptoId);
  const message = {encryptedContent: await cryptoDriver.encrypt(plaintext)};
  console.log('payload created: ', message, ticket, contactPortId);
  await API.createContactPortTicket(
    contactPortId,
    ticket,
    chatData.lineId,
    message,
  );
  const version = CURRENT_CONTACTPORT_VERSION;
  const contactPortCryptoData = await new CryptoDriver(
    authorizedContactPort.cryptoId,
  ).getContactPortData();
  const bundle: DirectContactPortBundle = {
    portId: contactPortId,
    version,
    org: ORG_NAME,
    target: BundleTarget.contactPort,
    name: chatData.name,
    rad: contactPortCryptoData.rad,
    keyHash: contactPortCryptoData.peerPublicKeyHash,
    pubkey: contactPortCryptoData.publicKey,
    ticket: ticket,
  };
  return bundle;
}

/**
 * Converts a contact port bundle into a clickable link
 * @param portId
 * @param bundleString
 * @returns
 */
export async function getContactPortBundleClickableLink(
  _portId: string,
  bundleString: string | null = null,
) {
  if (!bundleString) {
    throw new Error('NoBundleData');
  }
  const bundleId = await API.getBundleId(bundleString, true);
  return BUNDLE_ID_PREPEND_LINK + bundleId;
}

/**
 * Pause a contact port for a pairHash
 * @param pairHash
 */
export async function pauseContactPortForPairHash(pairHash: string) {
  const contactPortBundle = await fetchContactPortBundle(pairHash);
  await API.pauseContactPorts([contactPortBundle.portId]);
  await storageContactPorts.updateContactPortData(contactPortBundle.portId, {
    paused: true,
  });
  const chatId = await getChatIdFromPairHash(pairHash);
  if (chatId) {
    const directChat = new DirectChat(chatId);
    await directChat.updatePermissions({contactSharing: false});
  }
}

/**
 * Resume a contact port for a pairHash
 * @param pairHash
 */
export async function resumeContactPortForPairHash(pairHash: string) {
  const contactPortBundle = await fetchContactPortBundle(pairHash);
  await API.resumeContactPorts([contactPortBundle.portId]);
  await storageContactPorts.updateContactPortData(contactPortBundle.portId, {
    paused: false,
  });
  const chatId = await getChatIdFromPairHash(pairHash);
  if (chatId) {
    const directChat = new DirectChat(chatId);
    await directChat.updatePermissions({contactSharing: true});
  }
}

export async function remotePauseContactPorts(contactPortIds: string[]) {
  API.pauseContactPorts(contactPortIds);
}
export async function remoteResumeContactPorts(contactPortIds: string[]) {
  API.resumeContactPorts(contactPortIds);
}

/**
 * Disable contact sharing for a direct chat
 * @param chatId
 */
export async function pauseContactPortForDirectChat(chatId: string) {
  const directChat = new DirectChat(chatId);
  const pairHash = (await directChat.getChatData()).pairHash;
  await pauseContactPortForPairHash(pairHash);
}

/**
 * Resume contact sharing for a direct chat
 * @param chatId
 */
export async function resumeContactPortForDirectChat(chatId: string) {
  const directChat = new DirectChat(chatId);
  const pairHash = (await directChat.getChatData()).pairHash;
  await resumeContactPortForPairHash(pairHash);
}

/**
 * Read and accept a contact port bundle
 * @param portBundle - contact port bundle
 * @param ticket - ticket issued with the contact port
 * @param channel - channel through which the contact port was accessed
 * @param folderId - folder to which new chat should go to
 */
export async function acceptContactBundle(
  portBundle: DirectContactPortBundle,
  channel: string | null,
  folderId: string = defaultFolderId,
) {
  //if ticket is not available with contact port, throw an exception
  if (!portBundle.ticket) {
    throw new Error('No ticket available with contact port');
  }
  //setup crypto
  const cryptoDriver = new CryptoDriver();
  await cryptoDriver.create();
  await cryptoDriver.updatePeerPublicKeyHashAndRad(
    portBundle.keyHash,
    portBundle.rad,
  );
  const cryptoId = cryptoDriver.getCryptoId();
  if (portBundle.pubkey) {
    // compute shared secret immediately if peer has readily shared their pubkey
    cryptoDriver.updateSharedSecret(portBundle.pubkey);
  }
  //save read port
  await storageReadPorts.newReadPort({
    portId: portBundle.portId,
    version: portBundle.version,
    target: portBundle.target,
    name: portBundle.name,
    usedOnTimestamp: generateISOTimeStamp(),
    expiryTimestamp: null,
    channel: channel,
    ticket: portBundle.ticket,
    cryptoId: cryptoId,
    folderId: folderId,
  });
}

/**
 * Accept an authorized contact port that the user can share with others.
 * @param bundle - direct contact port bundle
 * @param chatId - chat Id that owns the contact port bundle.
 */
export async function acceptAuthorizedContactBundle(
  bundle: DirectContactPortBundle,
  chatId: string,
) {
  try {
    const connection = await getConnection(chatId);
    const existingAcceptedContactPort =
      await storageContactPorts.getAcceptedContactPortDataFromPairHash(
        connection.pairHash,
      );
    if (bundle.pubkey && !existingAcceptedContactPort) {
      //setup crypto
      const cryptoDriver = new CryptoDriver();
      // compute shared secret immediately if peer has readily shared their pubkey
      await cryptoDriver.createForContactPort({
        publicKey: bundle.pubkey,
        rad: bundle.rad,
        peerPublicKeyHash: bundle.keyHash,
      });
      const cryptoId = cryptoDriver.getCryptoId();
      await storageContactPorts.acceptContactPort({
        portId: bundle.portId,
        pairHash: connection.pairHash,
        owner: false,
        version: bundle.version,
        createdOnTimestamp: generateISOTimeStamp(),
        cryptoId: cryptoId,
      });
    }
  } catch (error) {
    console.log('Error accepting authorized contact bundle');
  }
}

/**
 * Resolve the mismatch between the server and client's state for a particular
 * ContactPort
 * @param anomalousContactPort The ContactPort exhibiting anomalous behaviour
 * @returns Whether the correct activation state for the ContactPort
 */
async function resolveContactPortSettingMismatch(
  anomalousContactPort: ContactPortData,
): Promise<boolean> {
  try {
    const authorizedCreatedChat = new DirectChat(
      await getChatIdFromPairHash(anomalousContactPort.pairHash),
    );
    const chatContactSharingPermission = (
      await authorizedCreatedChat.getPermissions()
    ).contactSharing;
    if (chatContactSharingPermission) {
      await resumeContactPortForPairHash(anomalousContactPort.pairHash);
      return true;
    } else {
      await pauseContactPortForPairHash(anomalousContactPort.pairHash);
      return false;
    }
  } catch (error) {
    console.error('Error resolving contact port setting mismatch: ', error);
    return false;
  }
}

/**
 * Accept a contact port ticket if such a contact port exits and the user is authorized to create a ticket.
 * @param contactPortId
 * @param ticketId
 */
export async function checkAndAcceptContactPortTicket(
  contactPortId: string,
  ticketId: string,
  chatId: string,
) {
  try {
    const connection = await getConnection(chatId);
    const contactPort = await getCreatedContactPortData(contactPortId);
    if (
      contactPort.paused &&
      !(await resolveContactPortSettingMismatch(contactPort))
    ) {
      // There's a mismatch between the client and the server.
      // Resolution has been completed, and the connection should not be attempted
      return;
    }
    //if pairHashes match and the contact port is not paused, accept the ticket.
    if (connection.pairHash === contactPort.pairHash) {
      console.log(
        'Checking and accepting ticket: ',
        contactPortId,
        ticketId,
        chatId,
      );
      await storageContactPorts.addContactPortTicket({
        contactPortId: contactPortId,
        ticketId: ticketId,
        active: true,
      });
    }
  } catch (error) {
    console.log('Error accepting contact port ticket: ', error);
  }
}

/**
 * Fetch data associated with a created contact port
 * @param contactPortId
 * @returns - contact port data
 */
async function getCreatedContactPortData(
  contactPortId: string,
): Promise<ContactPortData> {
  const portData = await storageContactPorts.getContactPortData(contactPortId);
  if (!portData) {
    throw new Error('NoContactPortFound');
  }
  return portData;
}

/**
 * Create a new direct chat using a generated superport and server assigned chat Id
 * @param portId - superport id of generated superport
 * @param lineId - chat Id assigned by the server
 */
export async function newChatOverCreatedContactPortBundle(
  portId: string,
  lineId: string,
  pairHash: string,
  introMessage: IntroMessage,
) {
  console.log('Attempting to create new chat over created contact port bundle');
  //if chat is already formed, this guard prevents retrying new chat over generated port.
  const chatExists = await checkLineExists(lineId);
  if (chatExists) {
    throw new Error(
      'Attempted to retry new chat over created contact port bundle',
    );
  }
  const createdContactPort: ContactPortData = await getCreatedContactPortData(
    portId,
  );
  if (!createdContactPort.cryptoId) {
    throw new Error('NoCryptoId');
  }
  const contactPortCryptoId: string = createdContactPort.cryptoId;
  const chat = new DirectChat();
  const contactPortCryptoDriver = new CryptoDriver(contactPortCryptoId);
  //check if contact port is already paused locally. If it is, we use this opportunity to try the API call.
  if (
    createdContactPort.paused &&
    !(await resolveContactPortSettingMismatch(createdContactPort))
  ) {
    // There's a mismatch between the client and the server.
    // Resolution has been completed, and the connection should not be attempted
    return;
  }
  //create crypto duplicated entry
  const cryptoDriver = new CryptoDriver();
  await cryptoDriver.create(await contactPortCryptoDriver.getData());
  const cryptoId = cryptoDriver.getCryptoId();
  //create chat permissions to be assigned to chat using folder Id
  const permissionsId = await createChatPermissionsFromFolderId(
    createdContactPort.folderId,
  );
  //create direct chat
  await chat.createChatUsingLineId(
    lineId,
    portId,
    {
      name: DEFAULT_NAME,
      authenticated: false,
      disconnected: false,
      cryptoId: cryptoId,
      connectedOn: generateISOTimeStamp(),
      connectionSource: 'contact://' + createdContactPort.pairHash,
      permissionsId: permissionsId,
    },
    introMessage,
    pairHash,
    createdContactPort.folderId,
    true, //ensure ticket is verified.
  );
  //increase the count of connections made using this superport
  await storageContactPorts.incrementConnectionsMade(
    createdContactPort.portId,
    generateISOTimeStamp(),
  );
  const chatId = chat.getChatId();
  generatorInitialInfoSend(chatId);
}

/**
 * Create a new direct chat using a read superport
 * @param readPortBundle - direct chat superport bundle that is read
 */
export async function newChatOverReadContactPortBundle(
  readPortBundle: ReadPortData,
) {
  if (!readPortBundle.cryptoId) {
    throw new Error('NoCryptoId');
  }
  if (!readPortBundle.ticket) {
    throw new Error('No ticket found');
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
      readPortBundle.ticket,
    );
    if (readPortBundle.channel) {
      const channel = readPortBundle.channel;
      if (channel.substring(0, 9) === 'shared://') {
        const fromChatId = channel.substring(9, 9 + 32);
        const messsageId = channel.substring(9 + 32 + 3, 9 + 32 + 3 + 32);
        const message = await getMessage(fromChatId, messsageId);
        if (message) {
          const update = message.data as ContactBundleParams;
          update.accepted = true;
          update.createdChatId = chat.getChatId();
          await updateMessageData(fromChatId, messsageId, update);
        }
      }
    }
    await storageReadPorts.deleteReadPortData(readPortBundle.portId);
    const chatId = chat.getChatId();
    await readerInitialInfoSend(chatId);
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
