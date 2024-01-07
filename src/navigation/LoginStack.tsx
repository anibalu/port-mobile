import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {ReactNode} from 'react';
import AppStack from './AppStack';
import {LoginStackTypes} from './LoginStackTypes';
import {useSelector} from 'react-redux';
import OnboardingStack from './OnboardingStack';

const Stack = createNativeStackNavigator<LoginStackTypes>();

function LoginStack({startOnboarding}: {startOnboarding: boolean}): ReactNode {
  const onboardingStatus = useSelector(
    state => state.profile.onboardingComplete,
  );

  return (
    <Stack.Navigator
      initialRouteName={
        startOnboarding || onboardingStatus ? 'AppStack' : 'OnboardingStack'
      }
      screenOptions={{headerShown: false, orientation: 'portrait'}}>
      {startOnboarding || onboardingStatus ? (
        <Stack.Screen name="AppStack" component={AppStack} />
      ) : (
        <Stack.Screen name="OnboardingStack" component={OnboardingStack} />
      )}
    </Stack.Navigator>
  );
}

export default LoginStack;
