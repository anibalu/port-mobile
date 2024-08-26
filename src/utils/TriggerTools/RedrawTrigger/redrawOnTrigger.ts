import store from '@store/appStore';
import {TRIGGER_TYPES} from '@store/triggerRedraw';

export const redrawOnNewMessage = () => {
  store.dispatch({
    type: TRIGGER_TYPES.NEW_MESSAGE,
  });
};

export const redrawOnFolderUpdate = () => {
  store.dispatch({
    type: TRIGGER_TYPES.FOLDER_UPDATE,
  });
};

export const redrawOnSuperportUpdate = () => {
  store.dispatch({
    type: TRIGGER_TYPES.SUPERPORT_UPDATE,
  });
};
