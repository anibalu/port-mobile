/**
 * A reducer for the user's profile info
 */

const initialState = {
  profile: {},
  onboardingComplete: false,
};

export default function profile(state = initialState, action: any) {
  switch (action.type) {
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: action.payload,
      };
    case 'ONBOARDING_COMPLETE':
      return {
        ...state,
        onboardingComplete: action.payload,
      };
    default:
      return state;
  }
}
