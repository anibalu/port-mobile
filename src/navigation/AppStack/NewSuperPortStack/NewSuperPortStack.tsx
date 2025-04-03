import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SuperPortProvider} from '@screens/NewSuperPort/context/SuperPortContext';
import {NewSuperPortStackParamList} from './NewSuperPortStackTypes';
import SuperPortQRScreen from '@screens/NewSuperPort/SuperPortQRScreen';
import SuperPortSettingsScreen from '@screens/NewSuperPort/SuperPortSettingsScreen';

const Stack = createNativeStackNavigator<NewSuperPortStackParamList>();

function NewSuperPortStack() {
  return (
    <>
      <SuperPortProvider>
        <Stack.Navigator
          screenOptions={{headerShown: false, orientation: 'portrait'}}>
          <Stack.Screen
            name="SuperPortQRScreen"
            component={SuperPortQRScreen}
            options={{gestureEnabled: false}}
          />
          <Stack.Screen
            name="SuperPortSettingsScreen"
            component={SuperPortSettingsScreen}
          />
        </Stack.Navigator>
      </SuperPortProvider>
    </>
  );
}

export default NewSuperPortStack;
