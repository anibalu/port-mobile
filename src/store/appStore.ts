import {combineReducers, configureStore} from '@reduxjs/toolkit';
import latestReceivedMessage from './latestReceivedMessage';
import latestSentMessage from './latestSentMessage';
import latestNewConnection from './latestNewConnection';
import connectionFsSyncMutex from './connectionFsSyncMutex';
import profile from './profile';
import authToken from './authToken';
import triggerPendingRequestsReload from './triggerPendingRequestsReload';
import latestMessageUpdate from './latestMessageUpdate';
import ping from './ping';
import initialLink from './initialLink';

const rootReducer = combineReducers({
  latestReceivedMessage,
  latestSentMessage,
  latestMessageUpdate,
  latestNewConnection,
  connectionFsSyncMutex,
  profile,
  authToken,
  triggerPendingRequestsReload,
  ping,
  initialLink,
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
