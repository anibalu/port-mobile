import * as storage from '../Storage/connections';
import {
  ConnectionInfo,
  ConnectionInfoUpdate,
  ConnectionInfoUpdateOnNewMessage,
  ChatType,
  ReadStatus,
} from './interfaces';
import {processName} from '@utils/Profile';
import {getFolderPermissions} from '@utils/ChatFolders';
import {updateChatPermissions} from '@utils/ChatPermissions';

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
 */
export async function updateConnectionOnNewMessage(
  update: ConnectionInfoUpdateOnNewMessage,
) {
  try {
    await storage.updateConnectionOnNewMessage(update);
  } catch (error) {
    console.log('Error updating a connection: ', error);
  }
}

/**
 * updates a connection as with new info. Updated connection doesn't move to the top of the array.
 * @param {ConnectionInfoUpdate} update - connection info to update with
 */
export async function updateConnection(update: ConnectionInfoUpdate) {
  try {
    await storage.updateConnection(update);
  } catch (error) {
    console.log('Error updating a connection: ', error);
  }
}

/**
 * Toggles a connection as read.
 * @param {string} chatId - connection to toggle read
 */
export async function toggleRead(chatId: string) {
  await updateConnection({
    chatId: chatId,
    newMessageCount: 0,
    readStatus: ReadStatus.read,
  });
}

/**
 * Toggles a connection as authenticated.
 * @param {string} chatId - connection to toggle authenticated
 */
export async function toggleConnectionAuthenticated(chatId: string) {
  await updateConnection({
    chatId: chatId,
    authenticated: true,
    newMessageCount: 0,
    readStatus: ReadStatus.new,
  });
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
 * Gets a list of connections ordered by timestamp
 */
export async function getConnections(): Promise<ConnectionInfo[]> {
  try {
    return await storage.getConnections();
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
