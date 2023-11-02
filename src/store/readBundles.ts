/**
 * A reducer for read bundles
 */

import {DirectConnectionBundles} from '../utils/Bundles/interfaces';

const initialState: DirectConnectionBundles = {
  bundles: [],
};

export default function readBundles(state = initialState, action: any) {
  switch (action.type) {
    case 'ADD_TO_READ_BUNDLES':
      return {
        ...state,
        bundles: [...state.bundles, action.payload],
      };
    case 'REMOVE_FROM_READ_BUNDLES':
      return {
        ...state,
        bundles: state.bundles.filter(
          item => item.data.linkId !== action.payload.data.linkId,
        ),
      };
    case 'UPDATE_READ_BUNDLES':
      return {
        ...state,
        bundles: action.payload,
      };
    default:
      return state;
  }
}
