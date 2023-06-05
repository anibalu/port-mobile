/**
 * Numberless Inc's messaging client app known as Bridge as of April 2023
 *
 * @format
 */

import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {foregroundMessageHandler} from './src/utils/messaging';
import {StatusBar} from 'react-native';

// Screens in the app
import Welcome from './src/screens/Welcome/Welcome';
import Placeholder from './src/screens/Placeholder/Placeholder';
import Onboarding from './src/screens/Onboarding/Onboarding';
import Home from './src/screens/Home/Home';
import SetupUser from './src/screens/SetupUser/SetupUser';
import RequestPermissions from './src/screens/RequestPermissions/RequestPermissions';
import ConnectionCentre from './src/screens/ConnectionCentre/ConnectionCentre';
import Scanner from './src/screens/Scanner/Scanner';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  // handle new messages in the foreground
  useEffect(() => {
    foregroundMessageHandler();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen
            name="RequestPermissions"
            component={RequestPermissions}
          />
          <Stack.Screen name="Onboarding" component={Onboarding} />
          <Stack.Screen name="SetupUser" component={SetupUser} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="ConnectionCentre" component={ConnectionCentre} />
          <Stack.Screen name="Scanner" component={Scanner} />
          <Stack.Screen name="Placeholder" component={Placeholder} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
