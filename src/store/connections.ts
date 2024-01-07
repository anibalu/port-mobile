/**
 * A reducer for connections
 */

import {
  ConnectionInfo,
  StoreConnection,
  StoreConnections,
} from '@utils/Connections/interfaces';

const initialState: StoreConnections = {
  connections: [],
};

export default function connections(state = initialState, action: any) {
  switch (action.type) {
    case 'ADD_CONNECTION':
      return {
        ...state,
        connections: [
          {
            chatId: action.payload.chatId,
            stringifiedConnection: JSON.stringify(action.payload),
          },
          ...state.connections.filter(
            item => item.chatId !== action.payload.chatId,
          ),
        ],
      };
    case 'DELETE_CONNECTION':
      return {
        ...state,
        connections: state.connections.filter(
          item => item.chatId !== action.payload,
        ),
      };
    case 'UPDATE_CONNECTION':
      return {
        ...state,
        connections: [
          {
            chatId: action.payload.chatId,
            stringifiedConnection: JSON.stringify(action.payload),
          },
          ...state.connections.filter(
            item => item.chatId !== action.payload.chatId,
          ),
        ],
      };
    case 'UPDATE_CONNECTION_WITHOUT_PROMOTING':
      return {
        ...state,
        connections: updatedConnectionsWithoutPromotion(
          state.connections,
          action.payload,
        ),
      };
    case 'LOAD_CONNECTIONS':
      return {
        ...state,
        connections: (action.payload as ConnectionInfo[]).map(connection => {
          return {
            chatId: connection.chatId,
            stringifiedConnection: JSON.stringify(connection),
          };
        }),
      };
    default:
      return state;
  }
}

function updatedConnectionsWithoutPromotion(
  oldConnections: StoreConnection[],
  update: ConnectionInfo,
) {
  const index: number = oldConnections.findIndex(
    obj => obj.chatId === update.chatId,
  );
  if (index !== -1) {
    oldConnections[index].stringifiedConnection = JSON.stringify(update);
  }
  return [...oldConnections];
}
