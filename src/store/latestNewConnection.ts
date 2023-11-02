/**
 * A reducer for the latest connection that someone else has begun initiating
 */
const initialState = {
  chatId: '',
  connectionLinkId: '',
};

export default function latestNewConnection(state = initialState, action: any) {
  switch (action.type) {
    case 'NEW_CONNECTION':
      return {
        ...state,
        chatId: action.payload.chatId,
        connectionLinkId: action.payload.connectionLinkId,
      };
    default:
      return state;
  }
}
