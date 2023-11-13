import {defaultDirectPermissions} from '../ChatPermissions/default';
import {ContentType} from '../Messaging/interfaces';
import {ConnectionInfo, ConnectionType, ReadStatus} from './interfaces';

export const generateConnections = (count: number) => {
  const connectionArray: Array<ConnectionInfo> = [];

  [...Array(count)].map((e, i) => {
    const id = (Math.random() + 1).toString(36).substring(7);
    const cn = {
      chatId: id,
      connectionType: ConnectionType.direct,
      name: `Tester ${i}`,
      permissions: defaultDirectPermissions,
      text: 'hi',
      recentMessageType: ContentType.text,
      readStatus: ReadStatus.new,
      authenticated: true,
      timestamp: '2023-11-13T05:11:06Z',
      newMessageCount: 1,
      disconnected: false,
    };
    connectionArray.push(cn);
  });

  return connectionArray;
};
