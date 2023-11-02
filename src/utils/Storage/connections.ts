import {ConnectionInfo} from '../Connections/interfaces';
import {
  deleteAllConnectionsRNFS,
  deleteConnectionRNFS,
  getConnectionRNFS,
  getConnectionsRNFS,
  saveConnectionsRNFS,
} from './StorageRNFS/connectionsHandlers';

/**
 * Returns the connections stored.
 * @param {boolean} blocking - whether the function should block until completed. default = false.
 * @returns {Promise<ConnectionInfo[]>} - An array containing all the connections
 */
export async function getConnections(blocking: boolean = false) {
  return await getConnectionsRNFS(blocking);
}
/**
 * Finds the connections info associated with a chatId.
 * @param {string} chatId - the chatId of the connection.
 * @param {boolean} blocking - whether the function should block until completed. default = false.
 * @returns {Promise<ConnectionInfo>} - the connection info associated with a chatId.
 */
export async function getConnection(chatId: string, blocking: boolean = false) {
  return await getConnectionRNFS(chatId, blocking);
}

/**
 * Saves connections to storage.
 * @param {boolean} blocking - whether the function should block until completed. default = false.
 * @param {Array<ConnectionInfo>} connections - the connections array to save.
 */
export async function saveConnections(
  connections: ConnectionInfo[],
  blocking: boolean = false,
) {
  await saveConnectionsRNFS(connections, blocking);
}

/**
 * Deletes a particular connection from storage.
 * @param {boolean} blocking - whether the function should block until completed. default = false.
 * @param {string} chatId - connection to delete.
 */
export async function deleteConnection(
  chatId: string,
  blocking: boolean = false,
) {
  await deleteConnectionRNFS(chatId, blocking);
}

/**
 * deletes all connections from storage.
 * @param {boolean} blocking - whether the function should block until completed. default = false.
 */
export async function deleteAllConnections(blocking: boolean = false) {
  await deleteAllConnectionsRNFS(blocking);
}
