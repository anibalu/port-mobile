import {combineReducers, configureStore} from '@reduxjs/toolkit';

import latestCallReducer from './call';
import connectionErrors from './connectionErrors';
import connectionFsSyncMutex from './connectionFsSyncMutex';
import latestNewConnection from './latestNewConnection';
import ping from './ping';
import profile from './profile';
import forceCloseModal from './triggerAllModalsClose';
import triggerPendingRequestsReload from './triggerPendingRequestsReload';
import triggerRedraw from './triggerRedraw';
import triggerUpdateStatusRefetch from './triggerUpdateStatusRefetch';

const rootReducer = combineReducers({
  triggerUpdateStatusRefetch,
  latestNewConnection,
  connectionFsSyncMutex,
  profile,
  triggerPendingRequestsReload,
  ping,
  triggerRedraw,
  forceCloseModal,
  latestCallReducer,
  connectionErrors,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});
export default store;
