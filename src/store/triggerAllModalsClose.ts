/**
 * Reducer that forces all modals to close.
 */
const initialState = {
  forceClose: false,
};

export default function forceCloseModal(state = initialState, action: any) {
  switch (action.type) {
    //Use this dispatch call to force close all modals.
    case 'CLOSE_MODAL':
      return {
        ...state,
        forceClose: true,
      };
    //This will not be used directly. This is automatically applied when modals are forced to be closed.
    case 'RESET_MODAL':
      return {
        ...state,
        forceClose: false,
      };
    default:
      return state;
  }
}
