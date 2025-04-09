import React, {ReactNode} from 'react';
import {View} from 'react-native';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {Colors} from '@components/colorGuide';

import AppStack from './AppStack/AppStack';
import OnboardingStack from './OnboardingStack/OnboardingStack';
import {RootStackTypes} from './RootStackTypes';


const Stack = createNativeStackNavigator<RootStackTypes>();

export function RootStack(): ReactNode {
  return (
    <Stack.Navigator
      screenOptions={{
        initialRouteName: 'SplashScreen',
        headerShown: false,
        orientation: 'portrait',
      }}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="OnboardingStack" component={OnboardingStack} />
      <Stack.Screen name="AppStack" component={AppStack} />
    </Stack.Navigator>
  );
}

function SplashScreen(): ReactNode {
  return <View style={{flex: 1, backgroundColor: Colors.dark.background}} />;
}
