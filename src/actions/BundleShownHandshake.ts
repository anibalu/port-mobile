/**
 * This action is responsible for the handshake protocol that is invoked when a bundle is shown.
 * @todo This needs to be reworked to accept authentication steps as below.
 * Use crypto driver to:
 * 1. initialise key file
 * 2. get user pub key
 * Use DirectMessaging class to:
 * 3. send user pub key (messageType: key)
 * Use Connection utils to:
 * 4. add new connection that's not yet authenticated.
 */
import {addConnection, ConnectionType} from '../utils/Connection';
import {
  checkProfilePicture,
  getProfilePicName,
  readProfileNickname,
} from '../utils/Profile';
import {DirectMessaging} from '../utils/DirectMessaging';
import {ContentType} from '../utils/MessageInterface';
import {defaultPermissions} from '../utils/permissionsInterface';
import {
  createTempFileUpload,
  largeFile,
  uploadLargeFile,
} from '../utils/LargeFiles';
import RNFS from 'react-native-fs';

/**
 * Handles the handshake when a connection bundle is shown by adding a connection and sending the user's nickname.
 *
 * @param {string} lineLinkId - The lineLinkId associated with the connection instrument.
 * @param {string} lineId - The lineId associated with the connection.
 * @returns {Promise<void>} A Promise that resolves once the shown handshake is processed.
 */
export async function bundleShownHandshake(
  lineLinkId: string,
  lineId: string,
): Promise<void> {
  const now: Date = new Date();
  await addConnection({
    connectionType: ConnectionType.line,
    id: lineId,
    memberId: '0001',
    nickname: '',
    userChoiceNickname: false,
    permissions: defaultPermissions,
    readStatus: 'new',
    timeStamp: now.toISOString(),
    authenticated: false,
  });
  const name = await readProfileNickname();
  const fileUri = await checkProfilePicture();
  if (fileUri) {
    //send nickname with display picture
    const file: largeFile = {
      uri: fileUri,
      name: await getProfilePicName(),
      type: 'image/jpeg',
    };
    await uploadFunc(file, lineId, name);
  } else {
    //send just nickname
    const messaging = new DirectMessaging(lineId);
    await messaging.sendMessage({
      messageId: messaging.generateMessageId(),
      messageType: ContentType.NICKNAME,
      data: {nickname: name},
    });
  }
}

const uploadFunc = async (file: largeFile, lineId: string, name: string) => {
  const fileUri = await createTempFileUpload(file);
  const mediaId = (await uploadLargeFile(fileUri))?.mediaId;
  await RNFS.unlink(fileUri.substring(7));
  if (mediaId === undefined) {
    const messaging = new DirectMessaging(lineId);
    await messaging.sendMessage({
      messageId: messaging.generateMessageId(),
      messageType: ContentType.NICKNAME,
      data: {nickname: name},
    });
  } else {
    const now: Date = new Date();
    const messaging = new DirectMessaging(lineId);
    await messaging.sendMessage({
      messageId: messaging.generateMessageId(),
      messageType: ContentType.NICKNAME,
      data: {
        nickname: name,
        mediaId: mediaId,
        filePath: fileUri,
        timestamp: now.toISOString(),
        sender: true,
        fileName: file.name,
      },
    });
  }
};
