/**
 * A reducer for the function to rerender the screen in the event of a new message
 */

const initialState = {
  content: {
    data: {
      messageContent: 'No new messages since starting the app',
      lineId: null,
      lineLinkId: null,
    },
  },
};

export default function latestMessage(state = initialState, action: any) {
  switch (action.type) {
    case 'NEW_MESSAGE':
      return {
        ...state,
        content: action.payload,
      };
    default:
      return state;
  }
}
