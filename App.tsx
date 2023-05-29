/**
 * Numberless Inc's messaging client app known as Bridge as of April 2023
 *
 * @format
 */

import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {foregroundMessageHandler} from './src/utils/messaging';

// Screens in the app
import Welcome from './src/screens/Welcome/Welcome';
import Placeholder from './src/screens/Placeholder/Placeholder';
import Onboarding from './src/screens/Onboarding/Onboarding';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  // handle new messages in the foreground
  useEffect(() => {
    foregroundMessageHandler();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Placeholder" component={Placeholder} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
