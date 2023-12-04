/**
 * A reducer for connections
 */

import {ConnectionInfo, Connections} from '@utils/Connections/interfaces';

const initialState: Connections = {
  connections: [],
};

export default function connections(state = initialState, action: any) {
  switch (action.type) {
    case 'ADD_CONNECTION':
      return {
        ...state,
        connections: [
          action.payload,
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
          action.payload,
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
        connections: action.payload,
      };
    default:
      return state;
  }
}

function updatedConnectionsWithoutPromotion(
  oldConnections: ConnectionInfo[],
  update: ConnectionInfo,
) {
  const index: number = oldConnections.findIndex(
    obj => obj.chatId === update.chatId,
  );
  if (index !== -1) {
    oldConnections[index] = update;
  }
  return oldConnections;
}
