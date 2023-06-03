import {connectionsPath} from '../configs/paths';
import RNFS from 'react-native-fs';

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
export async function initializeConnections(): Promise<void> {
  if (await RNFS.exists(pathToConnections)) {
    return;
  }
  // write an empty list to the file
  RNFS.writeFile(pathToConnections, JSON.stringify([]), ENCODING);
}

export async function addConnection(
  connection: Connection,
): Promise<Array<Connection>> {
  await initializeConnections();
  const connections = await getConnections();
  connections.push(connection);
  await RNFS.writeFile(
    pathToConnections,
    JSON.stringify(connections),
    ENCODING,
  );

  return connections;
}

export async function getConnections(): Promise<Array<Connection>> {
  await initializeConnections();
  const connections: Array<Connection> = JSON.parse(
    await RNFS.readFile(pathToConnections),
  );
  return connections;
}
