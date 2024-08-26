import {generateISOTimeStamp} from '@utils/Time';

//enum of trigger types
export enum TRIGGER_TYPES {
  NEW_MESSAGE = 'REDRAW_ON_NEW_MESSAGE',
  FOLDER_UPDATE = 'REDRAW_ON_FOLDER_UPDATE',
  SUPERPORT_UPDATE = 'REDRAW_ON_SUPERPORT_UPDATE',
}

export type TriggerType = (typeof TRIGGER_TYPES)[keyof typeof TRIGGER_TYPES];

/**
 * Reducer that manages redraw triggers throughout the app
 */
const initialState = {
  redrawOnNewMessage: '',
  redrawOnFolderUpdate: '',
  redrawOnSuperportUpdate: '',
};

export default function triggerRedraw(
  state = initialState,
  action: {type: string},
) {
  switch (action.type) {
    case TRIGGER_TYPES.NEW_MESSAGE:
      return {
        ...state,
        redrawOnNewMessage: generateISOTimeStamp(),
      };
    case TRIGGER_TYPES.FOLDER_UPDATE:
      return {
        ...state,
        redrawOnFolderUpdate: generateISOTimeStamp(),
      };
    case TRIGGER_TYPES.SUPERPORT_UPDATE:
      return {
        ...state,
        redrawOnSuperportUpdate: generateISOTimeStamp(),
      };
    default:
      return state;
  }
}
