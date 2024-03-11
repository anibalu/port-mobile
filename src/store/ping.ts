import {generateISOTimeStamp} from '@utils/Time';

/**
 * Reducer that manages pings throughout the app
 */
const initialState = {
  ping: 'pong',
};

export default function ping(state = initialState, action: any) {
  switch (action.type) {
    case 'PING':
      return {
        ...state,
        ping: generateISOTimeStamp(),
      };
    default:
      return state;
  }
}
