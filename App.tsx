/**
 * Numberless Inc's messaging client app Port
 */

import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';

import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import store from './src/store/appStore';

import {foregroundMessageHandler} from '@utils/Messaging/FCM/fcm';

import ErrorModal from '@components/ErrorModal';
import LoginStack from '@navigation/LoginStack';
import {loadConnectionsToStore} from '@utils/Connections';
import {checkProfileCreated} from '@utils/Profile';
import {ProfileStatus} from '@utils/Profile/interfaces';

import {addEventListener} from '@react-native-community/netinfo';
import {
  debouncedBtFOperations,
  debouncedPeriodicOperations,
} from '@utils/AppOperations';
import {AppState} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import Toast from 'react-native-toast-message';
import {ErrorModalProvider} from 'src/context/ErrorModalContext';

// import DeviceInfo from 'react-native-device-info';

function App(): JSX.Element {
  const appState = useRef(AppState.currentState);

  //check if initial setup is done, and accordingly decides which flow to render on app start
  const [initialLoad, setInitialLoad] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const profileCheck = async () => {
    try {
      const result = await checkProfileCreated();
      if (result === ProfileStatus.created) {
        setProfileExists(true);
        await loadConnectionsToStore();

        debouncedPeriodicOperations();
      }
    } catch (error) {
      console.log('Error checking profile:', error);
    } finally {
      await BootSplash.hide({fade: true}).then(() => {
        setInitialLoad(false);
      });
    }
  };
  useEffect(() => {
    profileCheck();
    // default way to handle new messages in the foreground
    foregroundMessageHandler();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      //If app has come to the foreground.
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        debouncedBtFOperations();
      }

      appState.current = nextAppState;
    });

    // Detects app going online-offline.
    const unsubscribe = addEventListener(state => {
      //Performs operation if the app is connected to any valid network (might not have internet access though)
      if (state.isConnected) {
        debouncedPeriodicOperations();
      }
    });

    return () => {
      subscription.remove();
      unsubscribe();
    };
  }, []);

  // useEffect(() => {
  //   (async () => {
  //     const isEmu = await DeviceInfo.isEmulator();
  //     if (isEmu) {
  //       const interval = setInterval(()=> {pullBacklog()}, 2000);
  //       // Clear the interval on component unmount
  //       return () => clearInterval(interval);
  //     }
  //   })()
  // }, []);

  if (initialLoad) {
    return <></>;
  }

  return (
    <>
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer>
            <ErrorModalProvider>
              <LoginStack startOnboarding={profileExists} />
              <ErrorModal />
            </ErrorModalProvider>
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
      <Toast />
    </>
  );
}

export default App;
