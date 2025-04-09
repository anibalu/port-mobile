import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {PortProvider} from '@screens/NewPort/context/PortContext';
import PortQRScreen from '@screens/NewPort/PortQRScreen';
import PortSettingsScreen from '@screens/NewPort/PortSettingsScreen';

import {NewPortStackParamList} from './NewPortStackTypes';

const Stack = createNativeStackNavigator<NewPortStackParamList>();

function NewPortStack() {
  return (
    <>
      <PortProvider>
        <Stack.Navigator
          screenOptions={{headerShown: false, orientation: 'portrait'}}>
          <Stack.Screen
            name="PortQRScreen"
            component={PortQRScreen}
            options={{gestureEnabled: false}}
          />
          <Stack.Screen
            name="PortSettingsScreen"
            component={PortSettingsScreen}
          />
        </Stack.Navigator>
      </PortProvider>
    </>
  );
}

export default NewPortStack;
