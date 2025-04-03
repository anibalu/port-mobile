import {combineReducers, configureStore} from '@reduxjs/toolkit';
import latestNewConnection from './latestNewConnection';
import connectionFsSyncMutex from './connectionFsSyncMutex';
import profile from './profile';
import triggerPendingRequestsReload from './triggerPendingRequestsReload';
import ping from './ping';
import triggerUpdateStatusRefetch from './triggerUpdateStatusRefetch';
import triggerRedraw from './triggerRedraw';
import forceCloseModal from './triggerAllModalsClose';
import latestCallReducer from './call';

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
