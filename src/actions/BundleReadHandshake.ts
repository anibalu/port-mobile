/**
 * This action is responsible for the handshake protocol that is invoked when a bundle is read.
 * @todo This needs to be reworked to accept authentication steps.
 */
import {bundle} from '../utils/bundles';
import {createLine} from '../utils/line';
import {addConnection, ConnectionType} from '../utils/Connection';
import {
  checkProfilePicture,
  getProfilePicName,
  readProfileNickname,
} from '../utils/Profile';
import {saveReadBundle} from '../utils/bundles';
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
 * Function to create a connection given a bundle.
 * If connection creation succeeds, it adds an unauthenticated connection and sends user nickname
 * If connection creation fails, bundle is saved for later attempt.
 *
 * @param {bundle} bundle - The bundle object containing data related to the read handshake.
 * @returns {Promise<void>} A Promise that resolves once the read handshake bundle is processed.
 */
export async function bundleReadHandshake(bundle: bundle): Promise<void> {
  try {
    const response = await createLine(bundle.bundles.data.linkId);
    if (response) {
      const now: Date = new Date();
      if (bundle.bundles.label) {
        await addConnection({
          connectionType: ConnectionType.line,
          id: response.newLine,
          memberId: '0001',
          nickname: bundle.bundles.label,
          userChoiceNickname: true,
          permissions: defaultPermissions,
          readStatus: 'new',
          timeStamp: now.toISOString(),
          authenticated: false,
        });
      } else {
        await addConnection({
          connectionType: ConnectionType.line,
          id: response.newLine,
          memberId: '0001',
          nickname: '',
          userChoiceNickname: false,
          permissions: defaultPermissions,
          readStatus: 'new',
          timeStamp: now.toISOString(),
          authenticated: false,
        });
      }

      const name = await readProfileNickname();
      const fileUri = await checkProfilePicture();
      if (fileUri) {
        //send nickname with display picture
        const file: largeFile = {
          uri: fileUri,
          name: await getProfilePicName(),
          type: 'image/jpeg',
        };
        await uploadFunc(file, response.newLine, name);
      } else {
        //send just nickname
        const messaging = new DirectMessaging(response.newLine);
        await messaging.sendMessage({
          messageId: messaging.generateMessageId(),
          messageType: ContentType.NICKNAME,
          data: {nickname: name},
        });
      }
    } else {
      throw new Error('network error in creating line');
    }
  } catch (error) {
    console.log(
      'error in immediate line creation. saving link and doing it later',
    );
    //save bundle for later attempt
    /**
     * @todo Attempt to re-attempt connection creation at a later time
     */
    await saveReadBundle(bundle);
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
