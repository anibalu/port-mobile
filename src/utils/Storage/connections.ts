import {generateISOTimeStamp} from '@utils/Time';
import * as DBCalls from './DBCalls/connections';
import {ChatType, NewMessageCountAction} from './DBCalls/connections';

/**
 * Get connections. By default, you get all connections.
 * If you filter by active, you only get connections that are not disconnected.
 * @param filterByActive - whether you want connections that are not disconnected.
 * @returns - connections
 */
export async function getConnections(
  filterByActive: boolean = false,
): Promise<DBCalls.ConnectionInfo[]> {
  const connections = await DBCalls.loadConnections();
  if (filterByActive) {
    return connections.filter(connection => !connection.disconnected);
  } else {
    return connections;
  }
}

/**
 * Get connections by chat folder
 * @param folderId
 * @returns - connections that belong to a folder
 * @todo - create a direct database layer for this
 */
export async function getConnectionsByFolder(
  folderId: string,
): Promise<DBCalls.ConnectionInfo[]> {
  return await DBCalls.loadConnectionsInFolder(folderId);
}

/**
 * This util returns all chats which has focus permission as true
 * @returns chats with focus permission turned on
 */
export async function getAllConnectionsInFocus(): Promise<
  DBCalls.ConnectionInfo[]
> {
  return await DBCalls.loadConnectionsInFocus();
}

/**
 * Finds the connection attributes associated with a chatId.
 * @param {string} chatId - the chatId of the connection.
 * @returns - the connection attributes associated with a chatId or null if there is no connection.
 */
export async function getConnection(
  chatId: string,
): Promise<DBCalls.ConnectionInfo> {
  const connection = await DBCalls.loadConnection(chatId);
  if (!connection) {
    throw new Error('No such connection');
  }
  return connection;
}

/**
 * Finds the basic connection entry associated with a chatId.
 * @param {string} chatId - the chatId of the connection.
 * @returns - the basic connection info associated with a chatId or null if there is no connection.
 */
export async function getBasicConnectionInfo(
  chatId: string,
): Promise<DBCalls.ConnectionEntry> {
  const connection = await DBCalls.getConnection(chatId);
  if (!connection) {
    throw new Error('No such connection');
  }
  return connection;
}

/**
 * Get lineId from chat Id.
 * @param chatId
 * @returns - lineId.
 */
export async function getLineIdFromChatId(chatId: string) {
  const connection = await DBCalls.getConnection(chatId);
  if (!connection) {
    throw new Error('No such connection');
  }
  return connection.routingId;
}

/**
 * Get groupId from chat Id.
 * @param chatId
 * @returns - groupId.
 */
export async function getGroupIdFromChatId(chatId: string) {
  const connection = await DBCalls.getConnection(chatId);
  if (!connection) {
    throw new Error('No such connection');
  }
  return connection.routingId;
}

/**
 * @param connection Add a new connection to storage
 */
export async function addConnection(connection: DBCalls.ConnectionEntry) {
  await DBCalls.addConnection(connection);
}

/**
 * Get new message count for a particular folder or for all connections
 * @param folderId - optional folderId
 * @returns - new message count
 */
export async function getNewMessageCount(folderId?: string) {
  return await DBCalls.getNewMessageCount(folderId);
}

/**
 *
 * @param update the update to make to a connection in storage
 * @param {DBCalls.NewMessageCountAction} [countAction=NewMessageCountAction.unchanged] The action to perform on the message count.
 */
export async function updateConnection(
  update: DBCalls.ConnectionUpdate,
  countAction?: DBCalls.NewMessageCountAction,
) {
  await DBCalls.updateConnection(update, countAction);
}

/**
 * Ensures connection current timestamp is added with update.
 * @param update the update to make to a connection in storage
 * @param {DBCalls.NewMessageCountAction} [countAction=NewMessageCountAction.unchanged] The action to perform on the message count.
 */
export async function updateConnectionOnNewMessage(
  update: DBCalls.ConnectionUpdate,
  countAction?: DBCalls.NewMessageCountAction,
) {
  update.timestamp = update.timestamp || generateISOTimeStamp();
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
  update: DBCalls.ConnectionUpdate,
) {
  try {
    //TODO: debt-combine to single DB query
    const connection = await DBCalls.getConnection(update.chatId);

    if (connection && connection.latestMessageId === messageIdToBeUpdated) {
      await DBCalls.updateConnection(update);
    }
  } catch (error) {
    console.log('Error updating a connection: ', error);
  }
}

/**
 * Deletes a particular connection from storage.
 * @param {string} chatId - connection to delete.
 */
export async function deleteConnection(chatId: string) {
  await DBCalls.deleteConnection(chatId);
}

/**
 * Checks if chat is a group
 * @param chatId
 * @returns - true if in a group
 */
export async function isGroupChat(chatId: string) {
  const connection = await DBCalls.getConnection(chatId);
  if (connection === null) {
    return false;
  } else {
    const isGroup = connection.connectionType === ChatType.group;
    return isGroup;
  }
}

/**
 * Check if a connection exists
 * @param {string} chatId - chatId of connection
 * @returns - boolean indicating existence of connection
 */
export async function checkConnectionExists(chatId: string) {
  const connection = await DBCalls.getConnection(chatId);
  if (connection) {
    return true;
  }
  return false;
}

/**
 * Toggles a chat as read.
 * @param {string} chatId - chat to toggle read
 */
export async function toggleRead(chatId: string) {
  await DBCalls.updateConnection(
    {
      chatId: chatId,
    },
    NewMessageCountAction.reset,
  );
}

/**
 * This util gets a count of chats ina  folder
 * @returns a count
 */
export async function getCountOfChatsInAFolder(folderId: string) {
  return await DBCalls.getCountOfChatsInAFolder(folderId);
}

/**
 * This util gets profile photos of chats in a folder
 * @param folderId
 * @returns - array of path to display pics
 * @todo - create a quicker dbcall for this
 */
export async function getProfilePhotosOfChatsInFolder(folderId: string) {
  const chats = await DBCalls.loadLimitedConnectionsInFolder(folderId);
  return chats.map(chat => chat.pathToDisplayPic);
}

/**
 * Get chatId associated with a routing
 * @param routingId - routing Id of the line
 * @returns - chatId if exists
 */
export async function getChatIdFromRoutingId(
  routingId: string,
): Promise<string | null> {
  return await DBCalls.getChatIdFromRoutingId(routingId);
}

/**
 * Get chatId associated with a pairHash
 * @param pairHash
 * @returns - chatId if exists
 */
export async function getChatIdFromPairHash(
  pairHash: string,
): Promise<string | null> {
  return await DBCalls.getChatIdFromPairHash(pairHash);
}
