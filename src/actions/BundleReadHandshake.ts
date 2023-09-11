/**
 * This action is responsible for the handshake protocol that is invoked when a bundle is read.
 * @todo This needs to be reworked to accept authentication steps.
 */
import {bundle} from '../utils/bundles';
import {createLine} from '../utils/line';
import {addConnection, ConnectionType} from '../utils/Connection';
import {readProfileNickname} from '../utils/Profile';
import {saveReadBundle} from '../utils/bundles';
import {DirectMessaging} from '../utils/DirectMessaging';
import {ContentType} from '../utils/MessageInterface';

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
      await addConnection({
        connectionType: ConnectionType.line,
        id: response.newLine,
        memberId: '0001',
        nickname: '',
        userChoiceNickname: false,
        readStatus: 'new',
        timeStamp: now.toISOString(),
        authenticated: false,
      });
      const name = await readProfileNickname();
      //send nickname
      const messaging = new DirectMessaging(response.newLine);
      await messaging.sendMessage({
        messageId: messaging.generateMessageId(),
        messageType: ContentType.NICKNAME,
        data: {nickname: name},
      });
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
