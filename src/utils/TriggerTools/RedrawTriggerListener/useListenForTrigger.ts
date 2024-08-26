import {TRIGGER_TYPES, TriggerType} from '@store/triggerRedraw';
import {useSelector} from 'react-redux';

export const useListenForTrigger = (type: TriggerType) => {
  const triggerStateMapping = {
    [TRIGGER_TYPES.NEW_MESSAGE]: 'redrawOnNewMessage',
    [TRIGGER_TYPES.FOLDER_UPDATE]: 'redrawOnFolderUpdate',
    [TRIGGER_TYPES.SUPERPORT_UPDATE]: 'redrawOnSuperportUpdate',
  };

  return useSelector(
    (state: any) => state.triggerRedraw[triggerStateMapping[type]],
  );
};
