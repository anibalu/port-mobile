/**
 * A reducer for a valid auth token
 */

const initialState = {
  savedToken: {},
};

export default function authToken(state = initialState, action: any) {
  switch (action.type) {
    case 'NEW_TOKEN':
      return {
        ...state,
        savedToken: action.payload,
      };
    default:
      return state;
  }
}
