import React, { ReactNode } from 'react';
import { View } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { Colors } from '@components/colorGuide';
import ErrorBottomSheet from '@components/Reusable/BottomSheets/ErrorBottomSheet';

import store from '@store/appStore';
import { ConnectionError, ConnectionErrorType } from '@store/connectionErrors';

import AppStack from './AppStack/AppStack';
import OnboardingStack from './OnboardingStack/OnboardingStack';
import { RootStackTypes } from './RootStackTypes';

const Stack = createNativeStackNavigator<RootStackTypes>();

export function RootStack(): ReactNode {

  const connectionError: ConnectionError = useSelector(
    (state: any) => state.connectionErrors,
  );

  const onCloseConnectionError = React.useCallback(() => {
    store.dispatch({
      type: ConnectionErrorType.NO_ERROR,
      payload: { error: '' },
    });
  }, []);

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          orientation: 'portrait',
        }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="OnboardingStack" component={OnboardingStack} />
        <Stack.Screen name="AppStack" component={AppStack} />
      </Stack.Navigator>
      <ErrorBottomSheet
        visible={connectionError.errorCode !== ConnectionErrorType.NO_ERROR}
        title={'Invalid Port Scanned'}
        description={
          connectionError?.error ||
          'This Port is not valid. Please use a valid Port.'
        }
        onClose={onCloseConnectionError}
      />
    </>
  );
}

function SplashScreen(): ReactNode {
  return <View style={{ flex: 1, backgroundColor: Colors.dark.background }} />;
}
