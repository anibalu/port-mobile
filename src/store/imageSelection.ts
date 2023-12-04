/**
 * @deprecated
 * A reducer for selection of messages on long press specifically for images
 */
const initialState = {
  isImageSelected: false,
};

export default function imageSelection(state = initialState, action: any) {
  switch (action.type) {
    case 'TOGGLE_BOOLEAN':
      return {
        ...state,
        isImageSelected: action.payload.isImageSelected,
      };
    default:
      return state;
  }
}
