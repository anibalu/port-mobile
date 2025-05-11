import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import OnboardingSetupScreen from '@screens/OnboardingSetupScreen/OnboardingSetupScreen';
import RestoreBackupScreen from '@screens/RestoreBackup/RestoreBackupScreen';
import RestoreFromCloud from '@screens/RestoreBackup/RestoreFromCloud';
import Welcome from '@screens/Welcome/Welcome';

import {OnboardingStackParamList} from './OnboardingStackTypes';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

function OnboardingStack() {
  return (
    <>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          orientation: 'portrait',
        }}>
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen
          name="OnboardingSetupScreen"
          component={OnboardingSetupScreen}
        />
        <Stack.Screen name="RestoreBackup" component={RestoreBackupScreen} />
        <Stack.Screen name="RestoreFromCloud" component={RestoreFromCloud} />
      </Stack.Navigator>
    </>
  );
}

export default OnboardingStack;
