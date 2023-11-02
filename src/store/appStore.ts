import {combineReducers, configureStore} from '@reduxjs/toolkit';
import latestMessage from './latestMessage';
import latestNewConnection from './latestNewConnection';
import connectionFsSyncMutex from './connectionFsSyncMutex';
import journaledMessages from './journaledMessages';
import connections from './connections';
import profile from './profile';
import authToken from './authToken';
import readBundles from './readBundles';
import mediaDownloading from './mediaDowloading';
import sendingMessages from './sendingMessages';

const rootReducer = combineReducers({
  latestMessage,
  latestNewConnection,
  connectionFsSyncMutex,
  journaledMessages,
  connections,
  profile,
  authToken,
  readBundles,
  mediaDownloading,
  sendingMessages,
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
