import {combineReducers, configureStore} from '@reduxjs/toolkit';
import latestReceivedMessage from './latestReceivedMessage';
import latestSentMessage from './latestSentMessage';
import latestNewConnection from './latestNewConnection';
import connectionFsSyncMutex from './connectionFsSyncMutex';
import journaledMessages from './journaledMessages';
import connections from './connections';
import profile from './profile';
import authToken from './authToken';
import readBundles from './readBundles';
import mediaDownloading from './mediaDowloading';
import sendingMessages from './sendingMessages';
import imageSelection from './imageSelection';
import latestSendStatusUpdate from './latestSendStatusUpdate';

const rootReducer = combineReducers({
  latestReceivedMessage,
  latestSentMessage,
  latestSendStatusUpdate,
  latestNewConnection,
  connectionFsSyncMutex,
  journaledMessages,
  connections,
  profile,
  authToken,
  readBundles,
  mediaDownloading,
  sendingMessages,
  imageSelection,
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
