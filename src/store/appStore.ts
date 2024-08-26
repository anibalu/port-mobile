import {combineReducers, configureStore} from '@reduxjs/toolkit';
import latestNewConnection from './latestNewConnection';
import connectionFsSyncMutex from './connectionFsSyncMutex';
import profile from './profile';
import authToken from './authToken';
import triggerPendingRequestsReload from './triggerPendingRequestsReload';
import ping from './ping';
import triggerUpdateStatusRefetch from './triggerUpdateStatusRefetch';
import triggerRedraw from './triggerRedraw';

const rootReducer = combineReducers({
  triggerUpdateStatusRefetch,
  latestNewConnection,
  connectionFsSyncMutex,
  profile,
  authToken,
  triggerPendingRequestsReload,
  ping,
  triggerRedraw,
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
