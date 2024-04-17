import {createNativeStackNavigator} from '@react-navigation/native-stack';
import NameScreen from '@screens/Onboarding/NameScreen';
import PermissionsScreen from '@screens/Onboarding/PermissionsScreen';
import SetupUser from '@screens/SetupUser/SetupUser';
import Welcome from '@screens/Welcome/Welcome';
import React from 'react';
import {OnboardingStackParamList} from './OnboardingStackTypes';
import RestoreAccount from '@screens/Onboarding/RestoreAccount';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

function OnboardingStack() {
  return (
    <>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          orientation: 'portrait',
          gestureEnabled: false,
        }}>
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="NameScreen" component={NameScreen} />
        <Stack.Screen name="PermissionsScreen" component={PermissionsScreen} />
        <Stack.Screen name="SetupUser" component={SetupUser} />
        <Stack.Screen name="RestoreAccount" component={RestoreAccount} />
      </Stack.Navigator>
    </>
  );
}

export default OnboardingStack;
