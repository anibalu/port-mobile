/**
 * Numberless Inc's messaging client app Port
 */

import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';

import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import store from './src/store/appStore';

import {
  foregroundMessageHandler,
  registerBackgroundMessaging,
} from '@utils/Messaging/fcm';

import runMigrations from './src/utils/Storage/Migrations';

runMigrations();

import ErrorModal from '@components/ErrorModal';
import LoginStack from '@navigation/LoginStack';
import {loadConnectionsToStore} from '@utils/Connections';
import pullBacklog from '@utils/Messaging/pullBacklog';
import {checkProfile} from '@utils/Profile';
import {ProfileStatus} from '@utils/Profile/interfaces';
import Toast from 'react-native-toast-message';
import {ErrorModalProvider} from 'src/context/ErrorModalContext';

function App(): JSX.Element {
  //check if initial setup is done, and accordingly decides which flow to render on app start
  const [profileExists, setProfileExists] = useState(false);
  const checkProfileCreated = async () => {
    try {
      const result = await checkProfile();
      if (result === ProfileStatus.created) {
        setProfileExists(true);
        //load up to store
        //load connections to store
        await loadConnectionsToStore();
        await pullBacklog();
        //load read bundles to store
        //await loadReadDirectConnectionBundlesToStore();
        //load journaled messages to store
        //await loadJournalToStore();
        // // handle any potential inital deep links
        // handleDeepLink({url: await Linking.getInitialURL()});
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  useEffect(() => {
    checkProfileCreated();
    // default way to handle new messages in the foreground
    foregroundMessageHandler();
  }, []);
  //set up background message handler here
  registerBackgroundMessaging();

  return (
    <>
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer>
            <ErrorModalProvider>
              <LoginStack startOnboarding={profileExists} />
              <ErrorModal />
            </ErrorModalProvider>
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
      <Toast />
    </>
  );
}

export default App;
