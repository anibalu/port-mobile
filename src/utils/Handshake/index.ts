/**
 * handshake protocols for direct connections.
 * For the purposes of this module, we call bundle generator Alice(A) and the bundle reader Bob(B).
 */
import {BundleReadResponse} from '../Bundles/interfaces';
import {
  AttemptNewDirectConnection,
  addConnection,
  deleteConnection,
  toggleAuthenticated,
} from '../Connections';
import {
  checkDirectConnectionBundleDataFormat,
  deleteGeneratedDirectConnectionBundle,
  getGeneratedDirectConnectionBundle,
  saveReadDirectConnectionBundle,
} from '../Bundles';
import {ConnectionType, ReadStatus} from '../Connections/interfaces';
import {defaultPermissions} from '../ChatPermissions/default';
import {ContentType, MessageType} from '../Messaging/interfaces';
import {generateISOTimeStamp} from '../Time';
import {getChatCrypto, saveChatCrypto} from '../Storage/crypto';
import {sendDirectMessage} from '../Messaging/sendDirectMessage';
import {sha256} from '../Crypto/sha';
import {generateKeyPair, generateSharedKey} from '../Crypto/x25519';
import {decryptMessage, encryptMessage} from '../Crypto/aes';
import {getProfileName} from '../Profile';
import store from '../../store/appStore';

/**
 * Actions performed when a connection bundle is read by Bob.
 * @param {string} rawBundle - stringified connection bundle that is read.
 * @returns {Promise<BundleReadResponse>} - based on whether actions succeeded or failed or encountered a format error. If failed becuase of network reasons, actions need to be triggered again.
 */
export async function handshakeActionsB1(
  rawBundle: string,
): Promise<BundleReadResponse> {
  try {
    //check if the bundle data is of the right format
    const bundle = checkDirectConnectionBundleDataFormat(rawBundle);
    try {
      //try creating a chatId by posting the direct connection link id.
      const chatId: string = await AttemptNewDirectConnection(
        bundle.data.linkId,
      );
      //if chatId received, add an unauthenticated connection.
      await addConnection({
        chatId: chatId,
        connectionType: ConnectionType.direct,
        name: '',
        permissions: defaultPermissions,
        recentMessageType: ContentType.newChat,
        readStatus: ReadStatus.new,
        authenticated: false,
        timestamp: generateISOTimeStamp(),
        newMessageCount: 0,
      });
      //save the nonce and pubkey hash from bundle into crypto storage.
      await saveChatCrypto(
        chatId,
        {nonce: bundle.data.nonce, pubKeyHash: bundle.data.pubkeyHash},
        true,
      );
      return BundleReadResponse.success;
    } catch (error) {
      console.log('Network issue in creating chatId', error);
      //if network issue, save the read bundle to bundle storage and try again later.
      await saveReadDirectConnectionBundle(bundle);
      return BundleReadResponse.networkError;
    }
  } catch (error) {
    console.log('Bundle format is incorrect, Handshake B1 error', error);
    return BundleReadResponse.formatError;
  }
}

/**
 * Actions performed after Alice receives a ChatId indicating Bob has successfully read her bundle.
 * @param {string} chatId - Id of the connection
 * @param {string} connectionLinkId - direct connection link Id used to form the connection.
 */
export async function handshakeActionsA1(
  chatId: string,
  connectionLinkId: string,
) {
  try {
    //add an unauthenticated connection and update store that a new connection has been created.
    store.dispatch({
      type: 'NEW_CONNECTION',
      payload: {
        chatId: chatId,
        connectionLinkId: connectionLinkId,
      },
    });
    //load up corresponding generated bundle, add label as name and delete it.
    const bundle = await getGeneratedDirectConnectionBundle(connectionLinkId);
    await addConnection({
      chatId: chatId,
      connectionType: ConnectionType.direct,
      name: bundle.label || '',
      permissions: defaultPermissions,
      recentMessageType: ContentType.newChat,
      readStatus: ReadStatus.new,
      authenticated: false,
      timestamp: generateISOTimeStamp(),
      newMessageCount: 0,
    });
    await deleteGeneratedDirectConnectionBundle(connectionLinkId);
    //save nonce and keys from generated bundle to crypto storage
    await saveChatCrypto(
      chatId,
      {
        nonce: bundle.data.nonce,
        pubKeyHash: bundle.data.pubkeyHash,
        privKey: bundle.keys.privKey,
        pubKey: bundle.keys.pubKey,
      },
      true,
    );
    //send public key.
    await sendDirectMessage(chatId, {
      contentType: ContentType.handshakeA1,
      messageType: MessageType.new,
      data: {pubKey: bundle.keys.pubKey},
    });
  } catch (error) {
    console.log('Handshake A1 error', error);
  }
}

/**
 * Actions performed by Bob after Alice's public key is received.
 * @param {string} chatId
 * @param {string} peerPubKey
 */
export async function handshakeActionsB2(chatId: string, peerPubKey: string) {
  try {
    //when public key is received, compare it with the saved hash.
    const cryptoData = await getChatCrypto(chatId, true);
    console.log('cryptodata: ', cryptoData);
    console.log('hash: ', peerPubKey);
    const compareHash = cryptoData.pubKeyHash === (await sha256(peerPubKey));
    //if hashes match, mark connection as authenticated. else destroy the connection and residuals.
    if (compareHash) {
      await toggleAuthenticated(chatId);
    } else {
      await deleteConnection(chatId);
      throw new Error('Hash Authentication Failed');
    }
    //generate your key pair
    const keys = await generateKeyPair();
    //generate shared secret
    const sharedSecret = await generateSharedKey(keys.privKey, peerPubKey);
    //save these to crypto storage
    await saveChatCrypto(
      chatId,
      {
        ...cryptoData,
        peerPubKey: peerPubKey,
        privKey: keys.privKey,
        pubKey: keys.pubKey,
        sharedSecret: sharedSecret.sharedSecret,
      },
      true,
    );
    //encrypt saved nonce
    const encryptedNonce = await encryptMessage(chatId, cryptoData.nonce || '');
    //send a message with your pubkey and encrypted nonce
    await sendDirectMessage(chatId, {
      contentType: ContentType.handshakeB2,
      messageType: MessageType.new,
      data: {pubKey: keys.pubKey, encryptedNonce: encryptedNonce},
    });
    //send a message with your name.
    await sendDirectMessage(chatId, {
      contentType: ContentType.name,
      messageType: MessageType.new,
      data: {name: await getProfileName()},
    });
    //todo: add send your profile picture if that permission is given
  } catch (error) {
    console.log('Handshake B2 error', error);
  }
}

/**
 * Actions performed by Alice after Bob's public key and encrypted nonce are received.
 * @param {string} chatId
 * @param {string} peerPubKey
 * @param {string} ciphertextNonce
 */
export async function handshakeActionsA2(
  chatId: string,
  peerPubKey: string,
  encryptedNonce: string,
) {
  try {
    //generate shared secret
    const cryptoData = await getChatCrypto(chatId);
    if (cryptoData.privKey === undefined) {
      throw new Error('No private key generated');
    }
    const sharedSecret = await generateSharedKey(
      cryptoData.privKey,
      peerPubKey,
    );
    //decrypt nonce and compare
    const nonce = await decryptMessage(chatId, encryptedNonce);
    const compareNonce = nonce === cryptoData.nonce;
    //if succeeds, mark connection as authenticated and save key to crypto storage. else destroy the connection and residuals.
    if (compareNonce) {
      await saveChatCrypto(
        chatId,
        {
          ...cryptoData,
          peerPubKey: peerPubKey,
          sharedSecret: sharedSecret.sharedSecret,
        },
        true,
      );
      await toggleAuthenticated(chatId);
    } else {
      await deleteConnection(chatId);
      throw new Error('Encrypted Nonce Authentication Failed');
    }
    //send a message with your name.
    await sendDirectMessage(chatId, {
      contentType: ContentType.name,
      messageType: MessageType.new,
      data: {name: await getProfileName()},
    });
    //todo: add send your profile picture if that permission is given
  } catch (error) {
    console.log('Handshake A2 error', error);
  }
}
