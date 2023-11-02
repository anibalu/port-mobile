/**
 * A reducer for the messages we are currently attempting to send.
 */

import {SendingMessages} from '../utils/Messaging/interfaces';

const initialState: SendingMessages = {
  sending: [],
};

export default function sendingMessages(state = initialState, action: any) {
  switch (action.type) {
    case 'ADD_TO_SENDING':
      return {
        ...state,
        sending: [...state.sending, action.payload],
      };
    case 'REMOVE_FROM_SENDING':
      return {
        ...state,
        sending: state.sending.filter(
          item => item.messageId !== action.payload.messageId,
        ),
      };
    case 'UPDATE_SENDING':
      return {
        ...state,
        sending: action.payload,
      };
    default:
      return state;
  }
}
