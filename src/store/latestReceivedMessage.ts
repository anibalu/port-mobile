/**
 * A reducer for the latest received message
 */

const initialState = {
  latestReceivedMessage: {},
};

export default function latestReceivedMessage(
  state = initialState,
  action: any,
) {
  switch (action.type) {
    case 'NEW_RECEIVED_MESSAGE':
      return {
        ...state,
        latestReceivedMessage: action.payload,
      };
    default:
      return state;
  }
}
