/**
 * A reducer for media currently being downloaded
 */

import {DownloadingMedia} from '../utils/Messaging/interfaces';

const initialState: DownloadingMedia = {
  media: [],
};

export default function mediaDownloading(state = initialState, action: any) {
  switch (action.type) {
    case 'ADD_TO_MEDIA_DOWNLOADING':
      return {
        ...state,
        media: [...state.media, action.payload],
      };
    case 'REMOVE_FROM_MEDIA_DOWNLOADING':
      return {
        ...state,
        media: state.media.filter(item => item !== action.payload),
      };
    case 'UPDATE_MEDIA_DOWNLOADING':
      return {
        ...state,
        media: action.payload,
      };
    default:
      return state;
  }
}
