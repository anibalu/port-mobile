/**
 * A reducer for the user's profile info
 */

const initialState = {
  profile: {},
};

export default function profile(state = initialState, action: any) {
  switch (action.type) {
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: action.payload,
      };
    default:
      return state;
  }
}
