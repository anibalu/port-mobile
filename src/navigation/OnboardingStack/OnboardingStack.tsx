import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Welcome from '@screens/Welcome/Welcome';
import React from 'react';
import {OnboardingStackParamList} from './OnboardingStackTypes';
import RestoreAccount from '@screens/Onboarding/RestoreAccount';
import OnboardingSetupScreen from '@screens/OnboardingSetupScreen/OnboardingSetupScreen';
import OnboardingQRScanner from '@screens/OnboardingScanner/OnboardingQRScanner';
import OnboardingLinkInput from '@screens/OnboardingLinkInput/OnboardingLinkInput';
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
          name="OnboardingQRScanner"
          component={OnboardingQRScanner}
        />
        <Stack.Screen
          name="OnboardingLinkInput"
          component={OnboardingLinkInput}
        />
        <Stack.Screen
          name="OnboardingSetupScreen"
          component={OnboardingSetupScreen}
        />
        <Stack.Screen name="RestoreAccount" component={RestoreAccount} />
      </Stack.Navigator>
    </>
  );
}

export default OnboardingStack;
