/**
 * A reducer for the latest sent message
 */

const initialState = {
  message: {},
};

export default function latestSentMessage(state = initialState, action: any) {
  switch (action.type) {
    case 'NEW_SENT_MESSAGE':
      return {
        ...state,
        message: action.payload,
      };
    default:
      return state;
  }
}
