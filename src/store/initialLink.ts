/**
 * A reducer for an initial link that re-directed to the app.
 */

const initialState = {
  initialLink: null,
};

export default function initialLink(state = initialState, action: any) {
  switch (action.type) {
    case 'NEW_LINK':
      return {
        ...state,
        initialLink: action.payload,
      };
    default:
      return state;
  }
}
