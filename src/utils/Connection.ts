import {connectionsPath} from '../configs/paths';
import RNFS from 'react-native-fs';
import { nicknameTruncate } from './Nickname';

const pathToConnections = RNFS.DocumentDirectoryPath + connectionsPath;
const ENCODING = 'utf8';

export enum ConnectionType {
  line = 'line',
  web = 'web',
}

export type Connection = {
  connectionType: ConnectionType;
  id: string;
  nickname: string; // capped at NICKNAME_LENGTH_LIMIT
  text?: string;
  pathToImage?: string; // the path to the profile picture/group picture
  timeStamp?: string; // ISO string format
  newMessageCount?: number;
  readStatus?: string; // read, sent, seen, new.
};

export type UpdateConnectionProps = {
  id: string;
  connectionType?: ConnectionType;
  nickname?: string; // capped at NICKNAME_LENGTH_LIMIT
  text?: string;
  pathToImage?: string; // the path to the profile picture/group picture
  timeStamp?: string; // ISO string format
  newMessageCount?: number;
  readStatus?: string; // read, sent, seen, new.
}

export async function initializeConnections(): Promise<void> {
  if (await RNFS.exists(pathToConnections)) {
    return;
  }
  // write an empty list to the file
  await RNFS.writeFile(pathToConnections, JSON.stringify([]), ENCODING);
}

export async function addConnection(
  connection: Connection,
): Promise<void> {
  await initializeConnections();
  const connections = await getConnections();
  connections.push(connection);
  await RNFS.writeFile(
    pathToConnections,
    JSON.stringify(connections),
    ENCODING,
  );
}

export async function getConnections(): Promise<Array<Connection>> {
  await initializeConnections();
  const connections: Array<Connection> = JSON.parse(
    await RNFS.readFile(pathToConnections),
  );
  return connections;
}

//update connection
export async function updateConnection(data:UpdateConnectionProps) {
  let newData:UpdateConnectionProps = data;
  const now = new Date();
  if (data.nickname) {
    newData.nickname = nicknameTruncate(data.nickname);
  }
  newData.timeStamp = now.toISOString();
  const connections = await getConnections();
  const updatedConnections = connections.map((connection) => {
    if (connection.id === data.id) {
      const final:Connection = { ...connection, ...newData };
      if (newData.text) {
        final.newMessageCount = connection.newMessageCount? connection.newMessageCount+1 : 1;
      }
      return final;
    }
    return connection;
  });
  await RNFS.writeFile(pathToConnections, JSON.stringify(updatedConnections), ENCODING);
}

//delete connection
export async function deleteConnection(lineId:string) {
  const connections = await getConnections();
  const updatedConnections = connections.filter((connection) => connection.id !== lineId);
  await RNFS.writeFile(pathToConnections, JSON.stringify(updatedConnections), ENCODING);
}

//delete all connections
export async function deleteAllConnections() {
  RNFS.writeFile(pathToConnections, JSON.stringify([]), ENCODING);
}
