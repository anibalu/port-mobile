import {combineReducers, configureStore} from '@reduxjs/toolkit';
import latestMessage from './latestMessage';
import latestNewConnection from './latestNewConnection';
import connectionFsSyncMutex from './connectionFsSyncMutex';

const rootReducer = combineReducers({
  latestMessage,
  latestNewConnection,
  connectionFsSyncMutex,
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
