import {createNativeStackNavigator} from '@react-navigation/native-stack';
import NameScreen from '@screens/Onboarding/NameScreen';
import PermissionsScreen from '@screens/Onboarding/PermissionsScreen';
import SetupUser from '@screens/SetupUser/SetupUser';
import Welcome from '@screens/Welcome/Welcome';
import React from 'react';
import {OnboardingStackParamList} from './OnboardingStackTypes';
import InformationScreen1 from '@screens/Onboarding/InformationFlow/InformationScreen1';
import InformationScreen2 from '@screens/Onboarding/InformationFlow/InformationScreen2';
import InformationScreen3 from '@screens/Onboarding/InformationFlow/InformationScreen3';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

function OnboardingStack() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="NameScreen" component={NameScreen} />
      <Stack.Screen name="PermissionsScreen" component={PermissionsScreen} />
      <Stack.Screen name="SetupUser" component={SetupUser} />
      <Stack.Screen name="InformationScreen1" component={InformationScreen1} />
      <Stack.Screen name="InformationScreen2" component={InformationScreen2} />
      <Stack.Screen name="InformationScreen3" component={InformationScreen3} />
    </Stack.Navigator>
  );
}

export default OnboardingStack;
