import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {ReactNode} from 'react';
import AppStack from './AppStack';
import {LoginStackTypes} from './LoginStackTypes';
import {useSelector} from 'react-redux';
import OnboardingStack from './OnboardingStack';

const Stack = createNativeStackNavigator<LoginStackTypes>();

/**
 * Decides which stack to navigate to:
 * 1. navigating user to onboarding (Onboarding stack) if profile setup is not done
 * 2. navigating user to home (App stack) is profile setup is done
 * @param startOnboarding - whether we should navigate to onboarding stack
 * @returns - appropriate navigation stack
 */
function LoginStack({startOnboarding}: {startOnboarding: boolean}): ReactNode {
  //overrides startOnboarding if onboarding is already completed and navigates App stack.
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
