/**
 * Numberless Inc's messaging client app known as Bridge as of April 2023
 *
 * @format
 */

import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  foregroundMessageHandler,
  registerBackgroundMessaging,
} from './src/utils/messagingFCM';
import {Linking, StatusBar} from 'react-native';

// Screens in the app
import Welcome from './src/screens/Welcome/Welcome';
import Placeholder from './src/screens/Placeholder/Placeholder';
import Onboarding from './src/screens/Onboarding/Onboarding';
import Home from './src/screens/Home/Home';
import SetupUser from './src/screens/SetupUser/SetupUser';
import RequestPermissions from './src/screens/RequestPermissions/RequestPermissions';
import ConnectionCentre from './src/screens/ConnectionCentre/ConnectionCentre';
import Scanner from './src/screens/Scanner/Scanner';
import NewContact from './src/screens/NewContact/NewContact';

import store from './src/store/appStore';
import {Provider} from 'react-redux';
import {readProfile} from './src/utils/Profile';
import DirectChat from './src/screens/Chat/DirectChat';
import {handleDeepLink} from './src/utils/deepLinking';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  //check if initial setup is done
  const [hasSharedSecret, setHasSharedSecret] = useState(false);
  useEffect(() => {
    const checkSharedSecret = async () => {
      try {
        const result = await readProfile();
        if (result.sharedSecret) {
          setHasSharedSecret(true);
        }
      } catch (error) {
        console.error('Error checking profile file:', error);
      }
    };
    checkSharedSecret();
    // default way to handle new messages in the foreground
    foregroundMessageHandler(store);
    // handle any potential inital deep links
    (async () => {
      handleDeepLink({url: await Linking.getInitialURL()});
    })();
  }, []);

  const initialRouteName = hasSharedSecret ? 'Home' : 'Welcome';
  //set up background message handler here
  registerBackgroundMessaging(store);
  // Handle any potential deeplinks while foregrounded/backgrounded
  Linking.addEventListener('url', handleDeepLink);
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{headerShown: false}}>
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen
              name="RequestPermissions"
              component={RequestPermissions}
            />
            <Stack.Screen name="Onboarding" component={Onboarding} />
            <Stack.Screen name="SetupUser" component={SetupUser} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen
              name="ConnectionCentre"
              component={ConnectionCentre}
            />
            <Stack.Screen name="NewContact" component={NewContact} />
            <Stack.Screen name="Scanner" component={Scanner} />
            <Stack.Screen name="DirectChat" component={DirectChat} />
            <Stack.Screen name="Placeholder" component={Placeholder} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
