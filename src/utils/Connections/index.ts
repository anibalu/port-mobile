import axios from 'axios';
import store from '../../store/appStore';
import {getToken} from '../ServerAuth';
import * as storage from '../Storage/connections';
import {generateISOTimeStamp} from '../Time';
import {
  ConnectionInfo,
  ConnectionInfoUpdate,
  ConnectionInfoUpdateOnNewMessage,
  ReadStatus,
} from './interfaces';
import {LINE_MANAGEMENT_RESOURCE} from '../../configs/api';
import {connectionFsSync} from '../Synchronization';
import {Permissions} from '../ChatPermissions/interfaces';

/**
 * Loads saved connections to store
 */
export async function loadConnectionsToStore() {
  try {
    const connections = await storage.getConnections(true);
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
    const synced = async () => {
      //add connection in cache
      store.dispatch({
        type: 'ADD_CONNECTION',
        payload: connection,
      });
      //add connection to storage
      const connections = await storage.getConnections(false);
      await storage.saveConnections(
        [
          connection,
          ...connections.filter(item => item.chatId !== connection.chatId),
        ],
        false,
      );
    };
    await connectionFsSync(synced);
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
  const synced = async () => {
    try {
      //read current connections from cache
      const entireState = store.getState();
      let connections: ConnectionInfo[] = entireState.connections.connections;
      let index: number = connections.findIndex(
        obj => obj.chatId === update.chatId,
      );
      if (index === -1) {
        //try loading connections from storage
        connections = await storage.getConnections(false);
        index = connections.findIndex(obj => obj.chatId === update.chatId);
        if (index === -1) {
          throw new Error('NoSuchChat');
        }
        //update connection
        connections[index] = {
          ...connections[index],
          ...update,
          timestamp: generateISOTimeStamp(),
          newMessageCount:
            update.readStatus === ReadStatus.new
              ? connections[index].newMessageCount + 1
              : connections[index].newMessageCount,
        };
        const newConnections = [
          connections[index],
          ...connections.slice(0, index),
          ...connections.slice(index + 1),
        ];
        //update cache
        store.dispatch({
          type: 'LOAD_CONNECTIONS',
          payload: newConnections,
        });
        //update storage
        await storage.saveConnections(newConnections, false);
      } else {
        //update connection
        connections[index] = {
          ...connections[index],
          ...update,
          timestamp: generateISOTimeStamp(),
          newMessageCount:
            update.readStatus === ReadStatus.new
              ? connections[index].newMessageCount + 1
              : connections[index].newMessageCount,
        };
        const newConnections = [
          connections[index],
          ...connections.slice(0, index),
          ...connections.slice(index + 1),
        ];
        //update cache
        store.dispatch({
          type: 'LOAD_CONNECTIONS',
          payload: newConnections,
        });
        //update storage
        await storage.saveConnections(newConnections, false);
      }
    } catch (error) {
      console.log('Error updating a connection on new message: ', error);
    }
  };
  await connectionFsSync(synced);
}

/**
 * updates a connection as with new info. Updated connection doesn't move to the top of the array.
 * @param {ConnectionInfoUpdate} update - connection info to update with
 */
export async function updateConnection(update: ConnectionInfoUpdate) {
  const synced = async () => {
    try {
      //read current connections from cache
      const entireState = store.getState();
      let connections: ConnectionInfo[] = entireState.connections.connections;
      let index: number = connections.findIndex(
        obj => obj.chatId === update.chatId,
      );
      if (index === -1) {
        //try loading connections from storage
        connections = await storage.getConnections(false);
        index = connections.findIndex(obj => obj.chatId === update.chatId);
        if (index === -1) {
          throw new Error('NoSuchChat');
        }
        //update connections
        connections[index] = {
          ...connections[index],
          ...update,
        };
        const newConnections = [
          ...connections.slice(0, index),
          connections[index],
          ...connections.slice(index + 1),
        ];
        //update cache
        store.dispatch({
          type: 'LOAD_CONNECTIONS',
          payload: newConnections,
        });
        //update storage
        await storage.saveConnections(newConnections, false);
      } else {
        //update connections
        connections[index] = {
          ...connections[index],
          ...update,
        };
        const newConnections = [
          ...connections.slice(0, index),
          connections[index],
          ...connections.slice(index + 1),
        ];
        //update cache
        store.dispatch({
          type: 'LOAD_CONNECTIONS',
          payload: newConnections,
        });
        //update storage
        await storage.saveConnections(newConnections, false);
      }
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
export async function toggleAuthenticated(chatId: string) {
  await updateConnection({
    chatId: chatId,
    authenticated: true,
    newMessageCount: 0,
    readStatus: ReadStatus.new,
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
    await storage.deleteConnection(chatId, true);
  } catch (error) {
    console.log('Error deleting a connection: ', error);
  }
}

/**
 * Delete all connections
 */
export async function deleteAllConnections() {
  try {
    //delete from cache
    store.dispatch({
      type: 'LOAD_CONNECTIONS',
      payload: [],
    });
    //delete from storage
    await storage.deleteAllConnections(true);
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
    //try getting connections from store
    const entireState = store.getState();
    let connections: ConnectionInfo[] = entireState.connections.connections;
    //If store is empty, try loading from storage
    if (connections.length === 0) {
      connections = await storage.getConnections(true);
    }
    return connections;
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
  //get connections
  const connections = await getConnections();
  //find the right connection
  let index: number = connections.findIndex(obj => obj.chatId === chatId);
  if (index === -1) {
    throw new Error('No such connection');
  }
  return connections[index];
}

/**
 * Gets a permissions associated with a connection
 * @param {string} chatId - chatId of connection
 */
export async function getConnectionPermissions(
  chatId: string,
): Promise<Permissions> {
  const connection = await getConnection(chatId);
  return connection.permissions;
}

export async function disconnectConnection(chatId: string) {
  try {
    const token = await getToken();
    await axios.patch(
      LINE_MANAGEMENT_RESOURCE,
      {
        lineId: chatId,
      },
      {headers: {Authorization: `${token}`}},
    );
    await updateConnection({chatId: chatId, disconnected: true});
  } catch (error) {
    console.log('failed to disconnect: ', error);
  }
}
