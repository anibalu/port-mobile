import {connectionsPath} from '../configs/paths';
import RNFS from 'react-native-fs';
import {nicknameTruncate} from './Nickname';
import {connectionFsSync} from './syncronization';
import {ContentType} from './MessageInterface';

const pathToConnections = RNFS.DocumentDirectoryPath + connectionsPath;
const ENCODING = 'utf8';

export enum ConnectionType {
  line = 'line',
  web = 'web',
}

export type Connection = {
  id: string;
  connectionType: ConnectionType;
  memberId: string; //0001 and 0002 for lines (0001 is the scanner)
  nickname: string; // capped at NICKNAME_LENGTH_LIMIT
  userChoiceNickname: boolean; //whether user wants to assign his own nickname to the connection
  text?: string;
  newMessageType?: string | ContentType;
  pathToImage?: string; // the path to the profile picture/group picture
  timeStamp?: string; // ISO string format
  newMessageCount?: number;
  //TO DO: support sending status
  readStatus?: string; // read, sent, seen, new
  authenticated?: boolean;
};

export type UpdateConnectionProps = {
  id: string;
  connectionType?: ConnectionType;
  memberId?: string;
  nickname?: string; // capped at NICKNAME_LENGTH_LIMIT
  userChoiceNickname?: boolean; //whether user wants to assign his own nickname to the connection
  text?: string;
  newMessageType?: string | ContentType;
  pathToImage?: string; // the path to the profile picture/group picture
  timeStamp?: string; // ISO string format
  newMessageCount?: number;
  readStatus?: string; // read, sent, seen, new.
  authenticated?: boolean;
};

export async function initializeConnections(): Promise<void> {
  if (await RNFS.exists(pathToConnections)) {
    return;
  }
  // write an empty list to the file
  await RNFS.writeFile(pathToConnections, JSON.stringify([]), ENCODING);
}

export async function addConnection(connection: Connection): Promise<void> {
  const synced = async () => {
    const connections = await getConnectionsAsync();
    connections.push(connection);
    await RNFS.writeFile(
      pathToConnections,
      JSON.stringify(connections),
      ENCODING,
    );
  };
  await connectionFsSync(synced);
}

async function getConnectionsAsync(): Promise<Array<Connection>> {
  await initializeConnections();
  const connections: Array<Connection> = JSON.parse(
    await RNFS.readFile(pathToConnections),
  );
  return connections;
}

export async function getConnections(): Promise<Array<Connection>> {
  const synced = async () => {
    return await getConnectionsAsync();
  };
  return await connectionFsSync(synced);
}

export async function getConnectionsOrdered(): Promise<Array<Connection>> {
  const synced = async () => {
    const connections: Array<Connection> = await getConnectionsAsync();
    connections.sort((a, b) => {
      if (a.timeStamp && b.timeStamp) {
        const aTime = new Date(a.timeStamp);
        const bTime = new Date(b.timeStamp);
        return bTime.getTime() - aTime.getTime();
      }
      return 0;
    });
    return connections;
  };
  return await connectionFsSync(synced);
}

export async function getConnectionAsync(id: string): Promise<Connection> {
  const connections: Array<Connection> = await getConnectionsAsync();
  const foundElement = connections.find(element => element.id === id);
  if (foundElement === undefined) {
    throw new Error('no such connection');
  }
  return foundElement;
}

export async function getConnection(id: string): Promise<Connection> {
  const synced = async () => {
    return await getConnectionAsync(id);
  };
  return await connectionFsSync(synced);
}

//update connection
export async function updateConnectionAsync(data: UpdateConnectionProps) {
  let newData: UpdateConnectionProps = data;
  const now = new Date();
  if (data.nickname) {
    newData.nickname = nicknameTruncate(data.nickname);
  }
  newData.timeStamp = now.toISOString();
  const connections = await getConnectionsAsync();
  const updatedConnections = connections.map(connection => {
    if (connection.id === data.id) {
      const final: Connection = {...connection, ...newData};
      if (newData.text && newData.readStatus === 'new') {
        final.newMessageCount = connection.newMessageCount
          ? connection.newMessageCount + 1
          : 1;
      }
      return final;
    }
    return connection;
  });
  await RNFS.writeFile(
    pathToConnections,
    JSON.stringify(updatedConnections),
    ENCODING,
  );
}

//update connection
export async function updateConnection(data: UpdateConnectionProps) {
  const synced = async () => {
    await updateConnectionAsync(data);
  };
  await connectionFsSync(synced);
}

//toggle all most recent message as read
export async function toggleRead(lineId: string) {
  const synced = async () => {
    const connections = await getConnectionsAsync();
    const updatedConnections = connections.map(connection => {
      if (connection.id === lineId) {
        let final: Connection = {...connection, newMessageCount: 0};
        if (connection.readStatus === 'new') {
          final = {...connection, readStatus: 'read'};
        }
        return final;
      }
      return connection;
    });
    await RNFS.writeFile(
      pathToConnections,
      JSON.stringify(updatedConnections),
      ENCODING,
    );
  };
  await connectionFsSync(synced);
}

//delete connection
export async function deleteConnection(lineId: string) {
  const synced = async () => {
    const connections = await getConnectionsAsync();
    const updatedConnections = connections.filter(
      connection => connection.id !== lineId,
    );
    await RNFS.writeFile(
      pathToConnections,
      JSON.stringify(updatedConnections),
      ENCODING,
    );
  };
  await connectionFsSync(synced);
}

//delete all connections
export async function deleteAllConnections() {
  const synced = async () => {
    RNFS.writeFile(pathToConnections, JSON.stringify([]), ENCODING);
  };
  await connectionFsSync(synced);
}
