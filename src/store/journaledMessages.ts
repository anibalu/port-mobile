/**
 * @deprecated
 * A reducer for the message journal
 */

import {JournaledMessages} from '@utils/Messaging/interfaces';

const initialState: JournaledMessages = {
  journal: [],
};

export default function journaledMessages(state = initialState, action: any) {
  switch (action.type) {
    case 'ADD_TO_JOURNAL':
      return {
        ...state,
        journal: [...state.journal, action.payload],
      };
    case 'REMOVE_FROM_JOURNAL':
      return {
        ...state,
        journal: state.journal.filter(
          item => item.messageId !== action.payload.messageId,
        ),
      };
    case 'UPDATE_JOURNAL':
      return {
        ...state,
        journal: action.payload,
      };
    default:
      return state;
  }
}
