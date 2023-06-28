import {bundle} from '../utils/bundles';
import {createLine} from '../utils/line';
import {addConnection, ConnectionType} from '../utils/Connection';
import {readProfileNickname} from '../utils/Profile';
import {saveReadBundle} from '../utils/bundles';
import {DirectMessaging} from '../utils/DirectMessaging';

export async function bundleReadHandshake(bundle: bundle) {
  /*
    1. attempt to create line
    If succeeds:
        2. add unauthenticated connection
    If fails:
        2. save read bundle
    */
  //this implementation differs because of absense of authentication.
  try {
    const response = await createLine(bundle.bundles.data.linkId);
    if (response) {
      const now: Date = new Date();
      await addConnection({
        connectionType: ConnectionType.line,
        id: response.newLine,
        memberId: '0001',
        nickname: '',
        readStatus: 'new',
        timeStamp: now.toISOString(),
        authenticated: false,
      });
      //use message class to do this.
      const name = await readProfileNickname();
      //send nickname
      const messaging = new DirectMessaging(response.newLine);
      await messaging.sendMessage({
        messageId: 'nan',
        messageType: 'nickname',
        data: {nickname: name},
      });
    } else {
      throw new Error('network error in creating line');
    }
  } catch (error) {
    console.log(
      'error in immediate line creation. saving link and doing it later',
    );
    await saveReadBundle(bundle);
  }
}
