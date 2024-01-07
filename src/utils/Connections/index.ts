import store from '../../store/appStore';
import * as storage from '../Storage/connections';
import {generateISOTimeStamp} from '../Time';
import {
  ConnectionInfo,
  ConnectionInfoUpdate,
  ConnectionInfoUpdateOnNewMessage,
  ChatType,
  ReadStatus,
} from './interfaces';
import {connectionFsSync} from '../Synchronization';
import {processName} from '@utils/Profile';

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
 * Loads saved connections to store
 */
export async function loadConnectionsToStore() {
  try {
    const connections = await storage.getConnections();
    if (connections.length >= 1) {
      store.dispatch({
        type: 'LOAD_CONNECTIONS',
        payload: connections,
      });
    }
  } catch (error) {
    console.log(
      'Error loading connections from storage and loading to store: ',
      error,
    );
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
    //add connection in cache
    store.dispatch({
      type: 'ADD_CONNECTION',
      payload: connection,
    });
  } catch (error) {
    console.log('Error adding a connection: ', error);
  }
}

/**
 * Updates connection info on new message being sent or received. updated connection goes to the top of the connections array.
 * @param {ConnectionInfoUpdateOnNewMessage} update - connection info to update
 */
export async function updateConnectionOnNewMessage(
  update: ConnectionInfoUpdateOnNewMessage,
) {
  try {
    //read current connections from store
    const entireState = store.getState();
    const connections: ConnectionInfo[] =
      entireState.connections.connections.map(conn =>
        JSON.parse(conn.stringifiedConnection),
      );
    const index: number = connections.findIndex(
      obj => obj.chatId === update.chatId,
    );
    if (index !== -1) {
      const updatedConnection = {
        ...connections[index],
        ...update,
        timestamp: generateISOTimeStamp(),
        newMessageCount:
          update.readStatus === ReadStatus.new
            ? connections[index].newMessageCount + 1
            : connections[index].newMessageCount,
      };
      store.dispatch({
        type: 'UPDATE_CONNECTION',
        payload: updatedConnection,
      });
    }
    await storage.updateConnection({
      ...update,
      timestamp: generateISOTimeStamp(),
      newMessageCount:
        update.readStatus === ReadStatus.new
          ? connections[index].newMessageCount + 1
          : connections[index].newMessageCount,
    });
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
    //read current connections from store
    const entireState = store.getState();
    let connections: ConnectionInfo[] = entireState.connections.connections.map(
      conn => JSON.parse(conn.stringifiedConnection),
    );
    const index: number = connections.findIndex(
      obj => obj.chatId === update.chatId,
    );
    if (index !== -1) {
      connections[index] = {
        ...connections[index],
        ...update,
      };
      store.dispatch({
        type: 'UPDATE_CONNECTION',
        payload: connections[index],
      });
    }
    await storage.updateConnection(update);
  } catch (error) {
    console.log('Error updating a connection: ', error);
  }
}
export async function updateConnectionWithoutPromotion(
  update: ConnectionInfoUpdate,
) {
  const synced = async () => {
    try {
      //read current connections from store
      const entireState = store.getState();
      let connections: ConnectionInfo[] =
        entireState.connections.connections.map(conn =>
          JSON.parse(conn.stringifiedConnection),
        );
      const index: number = connections.findIndex(
        obj => obj.chatId === update.chatId,
      );
      if (index !== -1) {
        connections[index] = {
          ...connections[index],
          ...update,
        };
        store.dispatch({
          type: 'UPDATE_CONNECTION_WITHOUT_PROMOTING',
          payload: connections[index],
        });
      }
      await storage.updateConnection(update);
    } catch (error) {
      console.log('Error updating a connection: ', error);
    }
  };
  await connectionFsSync(synced);
}

/**
 * Toggles a connection as read.
 * @param {string} chatId - connection to toggle read
 */
export async function toggleRead(chatId: string) {
  await updateConnectionWithoutPromotion({
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
  await updateConnectionWithoutPromotion({
    chatId: chatId,
    disconnected: true,
  });
}

export async function updateConnectionName(chatId: string, name: string) {
  await updateConnectionWithoutPromotion({
    chatId: chatId,
    name: processName(name),
  });
}

export async function updateConnectionDisplayPic(
  chatId: string,
  pathToDisplayPic: string,
) {
  await updateConnectionWithoutPromotion({
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
    //delete from cache
    store.dispatch({
      type: 'DELETE_CONNECTION',
      payload: chatId,
    });
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
 * Gets a list of connections
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
