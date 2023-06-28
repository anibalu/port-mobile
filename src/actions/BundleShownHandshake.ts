import {addConnection, ConnectionType} from '../utils/Connection';
import {readProfileNickname} from '../utils/Profile';
import {DirectMessaging} from '../utils/DirectMessaging';

export async function bundleShownHandshake(lineLinkId: string, lineId: string) {
  /*
    Use crypto driver to:
    1. initialise key file
    2. get user pub key

    Use DirectMessaging class to:
    3. send user pub key (messageType: key)

    Use Connection utils to:
    4. add new connection that's not yet authenticated.
    */
  //this implementation differs because of absense of authentication
  const now: Date = new Date();
  await addConnection({
    connectionType: ConnectionType.line,
    id: lineId,
    memberId: '0001',
    nickname: '',
    readStatus: 'new',
    timeStamp: now.toISOString(),
    authenticated: false,
  });
  const name = await readProfileNickname();
  //send nickname
  const messaging = new DirectMessaging(lineId);
  await messaging.sendMessage({
    messageId: 'nan',
    messageType: 'nickname',
    data: {nickname: name},
  });
}
