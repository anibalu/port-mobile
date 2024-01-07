/**
 * A reducer to trigger a reload of pending requests screen
 */

import {generateRandomHexId} from '@utils/IdGenerator';

const initialState = {
  change: '',
};

export default function triggerPendingRequestsReload(
  state = initialState,
  action: any,
) {
  switch (action.type) {
    case 'TRIGGER_RELOAD':
      return {
        ...state,
        change: generateRandomHexId(),
      };
    default:
      return state;
  }
}
