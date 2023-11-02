/**
 * A reducer for connections
 */

import {Connections} from '../utils/Connections/interfaces';

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
    case 'LOAD_CONNECTIONS':
      return {
        ...state,
        connections: action.payload,
      };
    default:
      return state;
  }
}
