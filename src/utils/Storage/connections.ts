import {ConnectionInfo, ConnectionInfoUpdate} from '../Connections/interfaces';
import * as DBCalls from './DBCalls/connections';

/**
 * Returns the connections stored.
 * @param {boolean} blocking - whether the function should block until completed. default = false.
 * @returns {Promise<ConnectionInfo[]>} - An array containing all the connections
 */
export async function getConnections(blocking: boolean = false) {
  blocking.toString();
  return await DBCalls.getConnections();
}
/**
 * Finds the connections info associated with a chatId.
 * @param {string} chatId - the chatId of the connection.
 * @param {boolean} blocking - deprecated value
 * @returns {Promise<ConnectionInfo>} - the connection info associated with a chatId.
 */
export async function getConnection(chatId: string, blocking: boolean = false) {
  blocking.toString();
  return await DBCalls.getConnection(chatId);
}

/**
 *
 * @param connection Add a new connection to storage
 * @param blocking deprecated value
 */
export async function addConnection(
  connection: ConnectionInfo,
  blocking: boolean = false,
) {
  blocking.toString();
  await DBCalls.addConnection(connection);
}

/**
 *
 * @param update the update to make to a connection in storage
 * @param blocking deprecated, unused value
 */
export async function updateConnection(
  update: ConnectionInfoUpdate,
  blocking: boolean = false,
) {
  blocking.toString();
  await DBCalls.updateConnection(update.chatId, update);
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
  blocking.toString();
  await DBCalls.deleteConnection(chatId);
}
