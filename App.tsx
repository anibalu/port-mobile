/**
 * Numberless Inc's messaging client app known as Bridge as of April 2023
 *
 * @format
 */

import React from 'react';
import {
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens in the app
import Welcome from './src/screens/Welcome/Welcome';
import Placeholder from './src/screens/Placeholder/Placeholder';
import Onboarding from './src/screens/Onboarding/Onboarding';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName='Welcome'
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Placeholder" component={Placeholder} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
});

export default App;
