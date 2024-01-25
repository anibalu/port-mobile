/**
 * A reducer for the user's profile info
 */

const initialState = {
  profile: {},
  onboardingComplete: false,
  showOnboardingInfo: false,
  activeChat: undefined,
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
        showOnboardingInfo: true,
      };
    case 'HIDE_ONBOARDING_INFO':
      return {
        ...state,
        showOnboardingInfo: false,
      };
    case 'ACTIVE_CHAT_CHANGED':
      return {
        ...state,
        activeChat: action.payload,
      };
    default:
      return state;
  }
}
