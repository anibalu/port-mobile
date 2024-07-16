import {generateISOTimeStamp} from '@utils/Time';
import {ConnectionInfo, ConnectionInfoUpdate} from '../Connections/interfaces';
import * as DBCalls from './DBCalls/connections';

/**
 * Get connections. By default, you get all connections.
 * If you filter by active, you only get connections that are not disconnected.
 * @param filterByActive - whether you want connections that are not disconnected.
 * @returns - connections
 */
export async function getConnections(
  filterByActive: boolean = false,
): Promise<ConnectionInfo[]> {
  const connections = await DBCalls.getConnections();
  if (filterByActive) {
    return connections.filter(connection => !connection.disconnected);
  } else {
    return connections;
  }
}
/**
 * Finds the connections info associated with a chatId.
 * @param {string} chatId - the chatId of the connection.
 * @returns - the connection info associated with a chatId or null if there is no connection.
 */
export async function getConnection(
  chatId: string,
): Promise<ConnectionInfo | null> {
  return await DBCalls.getConnection(chatId);
}

/**
 * @param connection Add a new connection to storage
 * @param blocking deprecated value
 */
export async function addConnection(connection: ConnectionInfo) {
  await DBCalls.addConnection(connection);
}

export async function getNewMessageCount(folderId?: string) {
  return await DBCalls.getNewMessageCount(folderId);
}

/**
 *
 * @param update the update to make to a connection in storage
 * @param {countAction} [countAction=NewMessageCountAction.unchanged] The action to perform on the message count.
 */
export async function updateConnection(
  update: ConnectionInfoUpdate,
  countAction?: DBCalls.NewMessageCountAction,
) {
  await DBCalls.updateConnection(update, countAction);
}

/**
 * Updates the connection if latestMessageId matches the given messageIdToBeUpdated
 * @param chatId - The ID of the chat/connection.
 * @param messageIdToBeUpdated - The ID of the message to be updated.
 * @param readStatus - The new read status to update.
 */
export async function updateConnectionIfLatestMessageIsX(
  messageIdToBeUpdated: string,
  update: ConnectionInfoUpdate,
) {
  try {
    //TODO: debt-combine to single DB query
    const connection = await getConnection(update.chatId);

    if (connection && connection.latestMessageId === messageIdToBeUpdated) {
      await updateConnection(update);
    }
  } catch (error) {
    console.log('Error updating a connection: ', error);
  }
}

/**
 *
 * @param update the update to make to a connection in storage
 * @param {countAction} [countAction=NewMessageCountAction.unchanged] The action to perform on the message count.
 */
export async function updateConnectionOnNewMessage(
  update: ConnectionInfoUpdate,
  countAction?: DBCalls.NewMessageCountAction,
) {
  update.timestamp = update.timestamp || generateISOTimeStamp();
  await DBCalls.updateConnection(update, countAction);
}

/**
 * Deletes a particular connection from storage.
 * @param {boolean} blocking - whether the function should block until completed. default = false.
 * @param {string} chatId - connection to delete.
 */
export async function deleteConnection(chatId: string) {
  await DBCalls.deleteConnection(chatId);
}
