/**
 * A reducer to trigger a reload of refetching the terms and conditions status.
 */

import {generateISOTimeStamp} from '@utils/Time';

const initialState = {
  change: '',
};

export default function triggerUpdateStatusRefetch(
  state = initialState,
  action: any,
) {
  switch (action.type) {
    case 'TRIGGER_TERMS_REFETCH':
      return {
        ...state,
        change: generateISOTimeStamp(),
      };
    default:
      return state;
  }
}
