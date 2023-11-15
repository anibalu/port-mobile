/**
 * Numberless Inc's messaging client app Port
 */

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {Linking, StatusBar} from 'react-native';

import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import store from './src/store/appStore';
import {loadReadDirectConnectionBundlesToStore} from './src/utils/Bundles/direct';
import {loadConnectionsToStore} from './src/utils/Connections';

import {
  foregroundMessageHandler,
  registerBackgroundMessaging,
} from './src/utils/Messaging/fcm';
import {loadJournalToStore} from './src/utils/Messaging/journal';
import {checkProfile} from './src/utils/Profile';
import {ProfileStatus} from './src/utils/Profile/interfaces';

import runMigrations from './src/utils/Storage/Migrations';

runMigrations();

import AppStack from './src/navigation/AppStack';
import OnboardingStack from './src/navigation/OnboardingStack';
import {handleDeepLink} from './src/utils/DeepLinking';
import pullBacklog from './src/utils/Messaging/pullBacklog';

type RootStackParamList = {
  AppStack: undefined;
  OnboardingStack: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): JSX.Element {
  //check if initial setup is done
  const [profileExists, setProfileExists] = useState(false);
  useEffect(() => {
    const checkProfileCreated = async () => {
      try {
        const result = await checkProfile();
        if (result === ProfileStatus.created) {
          setProfileExists(true);
          //load up to store
          //load connections to store
          await loadConnectionsToStore();
          //load read bundles to store
          await loadReadDirectConnectionBundlesToStore();
          //load journaled messages to store
          await loadJournalToStore();
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      }
    };
    (async () => {
      await pullBacklog();
    })();

    checkProfileCreated();
    // default way to handle new messages in the foreground
    foregroundMessageHandler();
    // handle any potential inital deep links
    (async () => {
      handleDeepLink({url: await Linking.getInitialURL()});
    })();
  }, []);

  //set up background message handler here
  registerBackgroundMessaging();
  // Handle any potential deeplinks while foregrounded/backgrounded
  Linking.addEventListener('url', handleDeepLink);
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={profileExists ? 'AppStack' : 'OnboardingStack'}
            screenOptions={{headerShown: false}}>
            <Stack.Screen name="AppStack" component={AppStack} />
            <Stack.Screen name="OnboardingStack" component={OnboardingStack} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
