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
import {readProfileNickname} from '../utils/Profile';
import {DirectMessaging} from '../utils/DirectMessaging';
import {ContentType} from '../utils/MessageInterface';
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
    readStatus: 'new',
    timeStamp: now.toISOString(),
    authenticated: false,
  });
  const name = await readProfileNickname();
  //send nickname
  const messaging = new DirectMessaging(lineId);
  await messaging.sendMessage({
    messageId: messaging.generateMessageId(),
    messageType: ContentType.NICKNAME,
    data: {nickname: name},
  });
}
