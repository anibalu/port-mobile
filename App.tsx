/**
 * Numberless Inc's messaging client app Port
 */

import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Linking} from 'react-native';

import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import store from './src/store/appStore';

import {
  foregroundMessageHandler,
  registerBackgroundMessaging,
} from '@utils/Messaging/fcm';

import runMigrations from './src/utils/Storage/Migrations';

runMigrations();

import LoginStack from '@navigation/LoginStack';
import Toast from 'react-native-toast-message';
import {handleDeepLink} from './src/utils/DeepLinking';
import {checkProfile} from '@utils/Profile';
import {ProfileStatus} from '@utils/Profile/interfaces';
import {loadConnectionsToStore} from '@utils/Connections';
import pullBacklog from '@utils/Messaging/pullBacklog';

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
        // handle any potential inital deep links
        handleDeepLink({url: await Linking.getInitialURL()});
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
  // Handle any potential deeplinks while foregrounded/backgrounded
  Linking.addEventListener('url', handleDeepLink);
  return (
    <>
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer>
            <LoginStack startOnboarding={profileExists} />
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
      <Toast />
    </>
  );
}

export default App;
