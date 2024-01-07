import CryptoDriver from '@utils/Crypto/CryptoDriver';
import DirectChat from './DirectChat';
import {hash} from '@utils/Crypto/hash';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType} from '@utils/Messaging/interfaces';
import {getChatPermissions} from '@utils/ChatPermissions';
import {ChatType} from '@utils/Connections/interfaces';
import {getProfilePicture} from '@utils/Profile';

/**
 * Actions performed by Bob after Alice's public key is received.
 * @param {string} chatId
 * @param {string} peerPublicKey
 */
export async function handshakeActionsB2(
  chatId: string,
  peerPublicKey: string,
) {
  try {
    const chat = new DirectChat(chatId);
    const chatData = await chat.getChatData();
    const cryptoDriver = new CryptoDriver(chatData.cryptoId);
    //check if peerPublicKey is validated
    const keyHash = await cryptoDriver.getPeerPublicKeyHash();
    if (!keyHash) {
      throw new Error('NullPeerPublicKeyHash');
    }
    if (keyHash !== (await hash(peerPublicKey))) {
      throw new Error('AuthenticationFailed');
    }
    await cryptoDriver.updateSharedSecret(peerPublicKey);
    await chat.toggleAuthenticated();
    const rad = await cryptoDriver.getRad();
    const encryptedRad = await cryptoDriver.encrypt(rad);
    //send public key and encryptedRad
    const sender = new SendMessage(chat.getChatId(), ContentType.handshakeB2, {
      pubKey: await cryptoDriver.getPublicKey(),
      encryptedRad: encryptedRad,
    });
    await sender.send(true, false);
  } catch (error) {
    console.log('HandshakeActionsB2 error: ', error);
  }
}

/**
 * Actions performed by Alice after Bob's public key and encrypted nonce are received.
 * @param {string} chatId
 * @param {string} peerPublicKey
 * @param {string} encryptedRad
 */
export async function handshakeActionsA2(
  chatId: string,
  peerPublicKey: string,
  encryptedRad: string,
) {
  try {
    const chat = new DirectChat(chatId);
    const chatData = await chat.getChatData();
    const fromSuperport = await chat.didConnectUsingSuperport();
    const cryptoDriver = new CryptoDriver(chatData.cryptoId);
    //check if rad is validated
    const rad = await cryptoDriver.getRad();
    await cryptoDriver.updateSharedSecret(peerPublicKey);
    const decryptedRad = await cryptoDriver.decrypt(encryptedRad);
    if (rad !== decryptedRad) {
      throw new Error('AuthenticationFailed');
    }
    await chat.toggleAuthenticated();
    //send profile picture request
    const sender = new SendMessage(chatId, ContentType.initialInfoRequest, {
      sendName: fromSuperport,
      sendProfilePicture: true,
    });
    await sender.send();
    //send profile picture if that permission is given
    const chatPermissions = await getChatPermissions(chatId, ChatType.direct);
    if (chatPermissions.displayPicture) {
      const profilePictureAttributes = await getProfilePicture();
      if (!profilePictureAttributes) {
        return;
      }
      const contentType =
        profilePictureAttributes.fileType === 'avatar'
          ? ContentType.displayAvatar
          : ContentType.displayImage;
      const sendDisplayPicture = new SendMessage(chatId, contentType, {
        ...profilePictureAttributes,
      });
      await sendDisplayPicture.send();
    }
  } catch (error) {
    console.log('HandshakeActionsA2 error: ', error);
  }
}
