import {generateISOTimeStamp} from '@utils/Time';

/**
 * Reducer that manages initiation of new calls
 */
const initialState = {
  latestCall: null,
  latestCallTime: null,
};

export default function latestCallReducer(state = {initialState}, action: any) {
  switch (action.type) {
    case 'NEW_CALL':
      return {
        ...state,
        latestCall: {
          time: generateISOTimeStamp(),
          chat: action.payload.chatId,
          callId: action.payload.callId,
        },
      };
    default:
      return state;
  }
}
