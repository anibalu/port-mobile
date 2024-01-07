/**
 * A reducer for the latest sent message
 */

const initialState = {
  updatedStatus: {},
  updatedMedia: {},
};

export default function latestMessageUpdate(state = initialState, action: any) {
  switch (action.type) {
    case 'NEW_SEND_STATUS_UPDATE':
      return {
        ...state,
        updatedStatus: action.payload,
      };
    case 'NEW_MEDIA_STATUS_UPDATE':
      return {
        ...state,
        updatedMedia: action.payload,
      };
    default:
      return state;
  }
}
