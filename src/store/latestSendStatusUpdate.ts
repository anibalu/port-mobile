/**
 * A reducer for the latest sent message
 */

const initialState = {
  updated: {},
};

export default function latestSendStatusUpdate(
  state = initialState,
  action: any,
) {
  switch (action.type) {
    case 'NEW_SEND_STATUS_UPDATE':
      return {
        ...state,
        updated: action.payload,
      };
    default:
      return state;
  }
}
