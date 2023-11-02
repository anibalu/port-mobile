import RNFS from 'react-native-fs';
import {connectionsPath} from '../../../configs/paths';
import {ConnectionInfo} from '../../Connections/interfaces';
import {connectionFsSync} from '../../Synchronization';
import {initialiseChatIdDirAsync} from './messagesHandlers';

const pathToConnections = RNFS.DocumentDirectoryPath + `${connectionsPath}`;
const DEFAULT_ENCODING = 'utf8';

/**
 * Initialises connections file
 * @returns {Promise<void>} - after the file is initialised.
 * @throws {Error} - If there is an issue initialising connections file.
 */
async function initializeConnectionsAsync(): Promise<void> {
  if (await RNFS.exists(pathToConnections)) {
    return;
  }
  await RNFS.writeFile(pathToConnections, JSON.stringify([]), DEFAULT_ENCODING);
}

/**
 * reads connections from connections file
 * @returns {Promise<ConnectionInfo[]>} - An array containing all the connections
 * @throws {Error} - If there is an error fetching connections.
 */
async function readConnectionsAsync() {
  await initializeConnectionsAsync();
  const connections: Array<ConnectionInfo> = JSON.parse(
    await RNFS.readFile(pathToConnections),
  );
  return connections;
}

/**
 * Finds the connections info associated with a chatId.
 * @param {string} chatId - the chatId of the connection to read.
 * @throws {Error} - If no such connection exists
 * @returns {Promise<ConnectionInfo>} - the connection info associated with a chatId.
 */
async function readConnectionAsync(chatId: string) {
  const connections = await readConnectionsAsync();
  const index: number = connections.findIndex(obj => obj.chatId === chatId);
  if (index !== -1) {
    throw new Error('NotSuchConnection');
  } else {
    return connections[index];
  }
}

/**
 * writes the new connections array to file
 * @param {Array<ConnectionInfo>} connections - the new connections array to write to file.
 * @throws {Error} - If write is unsuccessful.
 */
async function writeConnectionsAsync(connections: ConnectionInfo[]) {
  await initializeConnectionsAsync();
  await RNFS.writeFile(
    pathToConnections,
    JSON.stringify(connections),
    DEFAULT_ENCODING,
  );
}

/**
 * deletes a particular connections from file
 * @param {string} chatId - chatId of connection to delete
 * @throws {Error} - If delete is unsuccessful.
 */
async function deleteConnectionAsync(chatId: string) {
  const connections = (await readConnectionsAsync()).filter(
    item => item.chatId !== chatId,
  );
  await deleteFolderRecursive(chatId);
  await writeConnectionsAsync(connections);
}

/**
 * recursively deletes a folder and all items inside it.
 * @param {string} chatId - the chat folders to delete.
 */
async function deleteFolderRecursive(chatId: string) {
  const folderPath = await initialiseChatIdDirAsync(chatId);
  const isDirectory = await RNFS.stat(folderPath).then(stats =>
    stats.isDirectory(),
  );
  if (isDirectory) {
    const files = await RNFS.readDir(folderPath);
    for (const file of files) {
      if (file.isDirectory()) {
        await deleteFolderRecursive(file.path);
      } else {
        await RNFS.unlink(file.path);
      }
    }
    // After deleting all files and subfolders, delete the empty folder
    await RNFS.unlink(folderPath);
  } else {
    // If it's a file, just delete it
    await RNFS.unlink(folderPath);
  }
}

/**
 * deletes a all connections from file
 * @throws {Error} - If delete is unsuccessful.
 */
async function deleteAllConnectionsAsync() {
  const connections = await readConnectionsAsync();
  for (const connection of connections) {
    await deleteFolderRecursive(connection.chatId);
  }
  await writeConnectionsAsync([]);
}

/**
 * Returns the connections stored in connections file.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @returns {Promise<ConnectionInfo[]>} - An array containing all the connections
 */
export async function getConnectionsRNFS(
  blocking: boolean = false,
): Promise<ConnectionInfo[]> {
  if (blocking) {
    const synced = async () => {
      return await readConnectionsAsync();
    };
    return await connectionFsSync(synced);
  } else {
    return await readConnectionsAsync();
  }
}

/**
 * Finds the connections info associated with a chatId.
 * @param {string} chatId - the chatId of the connection to read.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @returns {Promise<ConnectionInfo>} - the connection info associated with a chatId.
 */
export async function getConnectionRNFS(
  chatId: string,
  blocking: boolean = false,
) {
  if (blocking) {
    const synced = async () => {
      return await readConnectionAsync(chatId);
    };
    return await connectionFsSync(synced);
  } else {
    return await readConnectionAsync(chatId);
  }
}

/**
 * Saves connections to file.
 * @param {Array<ConnectionInfo>} connections - the connections array to save.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveConnectionsRNFS(
  connections: ConnectionInfo[],
  blocking: boolean = false,
) {
  if (blocking) {
    const synced = async () => {
      await writeConnectionsAsync(connections);
    };
    await connectionFsSync(synced);
  } else {
    await writeConnectionsAsync(connections);
  }
}

/**
 * Deletes a connections from file
 * @param {string} chatId - the chatId of connection to delete.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function deleteConnectionRNFS(
  chatId: string,
  blocking: boolean = false,
) {
  if (blocking) {
    const synced = async () => {
      await deleteConnectionAsync(chatId);
    };
    await connectionFsSync(synced);
  } else {
    await deleteConnectionAsync(chatId);
  }
}

/**
 * Deletes all connections from file
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function deleteAllConnectionsRNFS(blocking: boolean = false) {
  if (blocking) {
    const synced = async () => {
      await deleteAllConnectionsAsync();
    };
    await connectionFsSync(synced);
  } else {
    await deleteAllConnectionsAsync();
  }
}
