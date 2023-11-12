import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Onboarding from '../screens/Onboarding/Onboarding';
import SetupUser from '../screens/SetupUser/SetupUser';
import RequestPermissions from '../screens/RequestPermissions/RequestPermissions';
import Welcome from '../screens/Welcome/Welcome';
import {OnboardingStackParamList} from './OnboardingStackTypes';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

function OnboardingStack() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Onboarding" component={Onboarding} />
      <Stack.Screen name="SetupUser" component={SetupUser} />
      <Stack.Screen name="RequestPermissions" component={RequestPermissions} />
    </Stack.Navigator>
  );
}

export default OnboardingStack;
