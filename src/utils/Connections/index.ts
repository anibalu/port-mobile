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
import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';
import {generateRandomHexId} from '@utils/Messaging/idGenerator';
import {saveMessage} from '@utils/Storage/messages';

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
      await storage.addConnection(connection, false);
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
      //read current connections from store
      const entireState = store.getState();
      const connections: ConnectionInfo[] = entireState.connections.connections;
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
      await storage.updateConnection(
        {
          ...update,
          timestamp: generateISOTimeStamp(),
          newMessageCount:
            update.readStatus === ReadStatus.new
              ? connections[index].newMessageCount + 1
              : connections[index].newMessageCount,
        },
        false,
      );
    } catch (error) {
      console.log('Error updating a connection: ', error);
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
      //read current connections from store
      const entireState = store.getState();
      let connections: ConnectionInfo[] = entireState.connections.connections;
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
      await storage.updateConnection(update, false);
    } catch (error) {
      console.log('Error updating a connection: ', error);
    }
  };
  await connectionFsSync(synced);
}
export async function updateConnectionWithoutPromotion(
  update: ConnectionInfoUpdate,
) {
  const synced = async () => {
    try {
      //read current connections from store
      const entireState = store.getState();
      let connections: ConnectionInfo[] = entireState.connections.connections;
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
      await storage.updateConnection(update, false);
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
export async function toggleAuthenticated(chatId: string) {
  const savedMessage: SavedMessageParams = {
    messageId: generateRandomHexId(),
    contentType: ContentType.info,
    data: {
      info: 'Handshake complete',
    },
    chatId: chatId,
    sender: false,
    timestamp: generateISOTimeStamp(),
  };
  await saveMessage(savedMessage);
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
    return true;
  } catch (error) {
    if (typeof error === 'object' && error.response) {
      if (error.response.status === 404) {
        console.log('failed to disconnect asdf: ', error.code);
        await updateConnection({chatId: chatId, disconnected: true});
        return true;
      }
    }
    return false;
  }
}
