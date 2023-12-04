/**
 * A reducer for the latest received message
 */

const initialState = {
  content: {
    data: {},
  },
};

export default function latestReceivedMessage(
  state = initialState,
  action: any,
) {
  switch (action.type) {
    case 'NEW_RECEIVED_MESSAGE':
      return {
        ...state,
        content: action.payload,
      };
    default:
      return state;
  }
}
