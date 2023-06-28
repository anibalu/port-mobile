/**
 * A reducer for the latest connection that someone else has begun initiating
 */
const initialState = {
  lineId: null,
  lineLinkId: null,
};

export default function latestNewConnection(state = initialState, action: any) {
  switch (action.type) {
    case 'NEW_CONNECTION':
      return {
        ...state,
        lineId: action.payload.lineId,
        lineLinkId: action.payload.lineLinkId,
      };
    default:
      return state;
  }
}
