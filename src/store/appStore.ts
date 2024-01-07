import {combineReducers, configureStore} from '@reduxjs/toolkit';
import latestReceivedMessage from './latestReceivedMessage';
import latestSentMessage from './latestSentMessage';
import latestNewConnection from './latestNewConnection';
import connectionFsSyncMutex from './connectionFsSyncMutex';
import connections from './connections';
import profile from './profile';
import authToken from './authToken';
import triggerPendingRequestsReload from './triggerPendingRequestsReload';
import latestMessageUpdate from './latestMessageUpdate';

const rootReducer = combineReducers({
  latestReceivedMessage,
  latestSentMessage,
  latestMessageUpdate,
  latestNewConnection,
  connectionFsSyncMutex,
  connections,
  profile,
  authToken,
  triggerPendingRequestsReload,
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
