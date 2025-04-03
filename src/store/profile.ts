/**
 * A reducer for the user's profile info needed by screens.
 * These are:
 * 1. name
 * 2. profile picture
 * 3. backup time
 */
const initialState = {
  //profile info
  profile: {},
};

export default function profile(state = initialState, action: any) {
  switch (action.type) {
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: action.payload,
      };
    case 'DELETE_PROFILE':
      return {
        ...state,
        profile: {},
      };
    default:
      return state;
  }
}
