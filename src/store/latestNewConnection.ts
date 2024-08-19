/**
 * A reducer for the latest connection that someone else has begun initiating
 */
const initialState = {
  lineId: '',
  groupId: '',
  connectionLinkId: '',
};

export default function latestNewConnection(state = initialState, action: any) {
  switch (action.type) {
    case 'NEW_CONNECTION':
      return {
        ...state,
        lineId: action.payload.lineId || '',
        groupId: action.payload.groupId || '',
        connectionLinkId: action.payload.connectionLinkId || '',
      };
    default:
      return state;
  }
}
