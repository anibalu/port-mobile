import * as storage from '../Storage/connections';
import {
  ConnectionInfo,
  ConnectionInfoUpdate,
  ConnectionInfoUpdateOnNewMessage,
  ChatType,
} from './interfaces';
import {processName} from '@utils/Profile';
import {getFolderPermissions} from '@utils/ChatFolders';
import {updateChatPermissions} from '@utils/ChatPermissions';
import {MessageStatus} from '@utils/Messaging/interfaces';
import {NewMessageCountAction} from '@utils/Storage/DBCalls/connections';

/**
 * Get connections by chat folder
 */
export async function getConnectionsByFolder(folderId: string) {
  const connections = await getConnections();
  return connections.filter(connection => connection.folderId === folderId);
}

/**
 * Assign connections to a different folder
 */
export async function moveConnectionsToNewFolder(
  connections: ConnectionInfo[],
  folderId: string,
) {
  //get folder permissions
  const folderPermissions = await getFolderPermissions(folderId);
  for (let index = 0; index < connections.length; index++) {
    //update chat permissions to folder permissions
    await updateChatPermissions(connections[index].chatId, folderPermissions);
    //update chat folder Id
    await updateConnection({
      chatId: connections[index].chatId,
      folderId: folderId,
    });
  }
}

/**
 * Assign connections to a different folder
 */
export async function moveConnectionToNewFolder(
  chatId: string,
  folderId: string,
) {
  //get folder permissions
  const folderPermissions = await getFolderPermissions(folderId);
  //update chat permissions to folder permissions
  await updateChatPermissions(chatId, folderPermissions);
  //update chat folder Id
  await updateConnection({
    chatId: chatId,
    folderId: folderId,
  });
}

/**
 * Checks if chat is a group
 */
export async function isGroupChat(chatId: string) {
  const connection = await storage.getConnection(chatId);
  if (connection === null) {
    return false;
  } else {
    const isGroup = connection.connectionType === ChatType.group;
    return isGroup;
  }
}

/**
 * Adds a connection to store and storage
 * @param {ConnectionInfo} connection - connection to be added
 */
export async function addConnection(connection: ConnectionInfo) {
  try {
    //add connection to storage
    await storage.addConnection(connection);
  } catch (error) {
    console.log('Error adding a connection: ', error);
  }
}

export async function getNewMessageCount() {
  return await storage.getNewMessageCount();
}

/**
 * Updates connection info on new message being sent or received. updated connection goes to the top of the connections array.
 * @param {ConnectionInfoUpdateOnNewMessage} update - connection info to update
 * @param {NewMessageCountAction} [countAction] - Optional action to update the message count.
 */
export async function updateConnectionOnNewMessage(
  update: ConnectionInfoUpdateOnNewMessage,
  countAction?: NewMessageCountAction,
) {
  try {
    await storage.updateConnectionOnNewMessage(update, countAction);
  } catch (error) {
    console.log('Error updating a connection: ', error);
  }
}

/**
 * Updates a connection as with new info. Updated connection doesn't move to the top of the array.
 * @param {ConnectionInfoUpdate} update - connection info to update with
 * @param {NewMessageCountAction} [countAction] - Optional action to update the message count.
 */
export async function updateConnection(
  update: ConnectionInfoUpdate,
  countAction?: NewMessageCountAction,
) {
  try {
    await storage.updateConnection(update, countAction);
  } catch (error) {
    console.log('Error updating a connection: ', error);
  }
}

/**
 * Updates the connection if latestMessageId matches the given messageIdToBeUpdated
 * @param chatId - The ID of the chat/connection.
 * @param messageIdToBeUpdated - The ID of the message to be updated.
 * @param readStatus - The new read status to update.
 */

export async function updateReadReceiptOnConnection({
  messageIdToBeUpdated,
  update,
}: {
  messageIdToBeUpdated: string;
  update: ConnectionInfoUpdate;
}) {
  try {
    await storage.updateConnectionIfLatestMessageIsX(
      messageIdToBeUpdated,
      update,
    );
  } catch (error) {
    console.log('Error updating a connection: ', error);
  }
}

/**
 * Toggles a connection as read.
 * @param {string} chatId - connection to toggle read
 */
export async function toggleRead(chatId: string) {
  await updateConnection(
    {
      chatId: chatId,
    },
    NewMessageCountAction.reset,
  );
}

/**
 * Toggles a connection as authenticated.
 * @param {string} chatId - connection to toggle authenticated
 */
export async function toggleConnectionAuthenticated(chatId: string) {
  await updateConnection(
    {
      chatId: chatId,
      authenticated: true,
      readStatus: MessageStatus.latest,
    },
    NewMessageCountAction.reset,
  );
}

export async function setConnectionDisconnected(chatId: string) {
  await updateConnection({
    chatId: chatId,
    disconnected: true,
  });
}

export async function updateConnectionName(chatId: string, name: string) {
  await updateConnection({
    chatId: chatId,
    name: processName(name),
  });
}

export async function updateConnectionDisplayPic(
  chatId: string,
  pathToDisplayPic: string,
) {
  await updateConnection({
    chatId: chatId,
    pathToDisplayPic: pathToDisplayPic,
  });
}

/**
 * Deletes a connection
 * @param {string} chatId - chatId of the connection
 */
export async function deleteConnection(chatId: string) {
  try {
    //delete from storage
    await storage.deleteConnection(chatId);
  } catch (error) {
    console.log('Error deleting a connection: ', error);
  }
}

/**
 * Please try to link to store to get list of connections, or get a specific connection info.
 * Only if that's not appropriate, use these helpers.
 */

/**
 * Get connections ordered by timestamp. By default, you get all connections.
 * If you filter by active, you only get connections that are not disconnected.
 * @param filterByActive - whether you want connections that are not disconnected.
 * @returns - connections
 */
export async function getConnections(
  filterByActive?: boolean,
): Promise<ConnectionInfo[]> {
  try {
    return await storage.getConnections(filterByActive);
  } catch (error) {
    console.log('Error loading connections: ', error);
    return [];
  }
}

/**
 * Gets a connection from connections
 * @param {string} chatId - chatId of connection
 */
export async function getConnection(chatId: string): Promise<ConnectionInfo> {
  const connection = await storage.getConnection(chatId);
  if (!connection) {
    throw new Error('No such connection');
  }
  return connection as ConnectionInfo;
}
