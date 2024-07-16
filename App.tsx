/**
 * Numberless Inc's messaging client app Port.
 * This screen is responsible for:
 * 1. Setsup Login Stack to decide if the user needs to be navigated to Onboarding or Home (based on if profile is setup)
 * 2. Sets up background operations and periodic foreground operations
 * 3. Provides Error modal context for the entire app. This allows us to display errors in the app.
 */

import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';

import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import store from './src/store/appStore';

import {foregroundMessageHandler} from '@utils/Messaging/FCM/fcm';

import ErrorModal from '@components/Modals/ErrorModal';
import LoginStack from '@navigation/LoginStack';
import {checkProfileCreated} from '@utils/Profile';
import {ProfileStatus} from '@utils/Profile/interfaces';

import {addEventListener} from '@react-native-community/netinfo';
import {
  debouncedPeriodicOperations,
  performBackgroundToForegroundOperations,
} from '@utils/AppOperations';
import {AppState} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import {ThemeProvider} from 'src/context/ThemeContext';
import {syncShared} from '@utils/Storage/IOSGroupShare/syncShare';
import {ToastProvider} from 'src/context/ToastContext';
import {ErrorModalProvider} from 'src/context/ErrorModalContext';
import Toast from '@components/Modals/Toast';

function App(): JSX.Element {
  const appState = useRef(AppState.currentState);

  //decides if app is in initial load state
  const [initialLoad, setInitialLoad] = useState(true);
  //decides if profile exists
  const [profileExists, setProfileExists] = useState(false);

  //checks if profile setup is done
  const profileCheck = async () => {
    try {
      const result = await checkProfileCreated();
      // If profile has been created
      if (result === ProfileStatus.created) {
        setProfileExists(true);
        //background operations are setup
        debouncedPeriodicOperations();
      }
    } catch (error) {
      // If profile has not been created or not created properly
      console.log('Error checking profile:', error);
      console.log(
        'Assuming profile does not exist and taking user to onboarding',
      );
    } finally {
      //hides splash screen
      await BootSplash.hide({fade: true}).then(() => {
        setInitialLoad(false);
      });
    }
  };
  useEffect(() => {
    profileCheck();
    // default way to handle new messages in the foreground
    foregroundMessageHandler();
    syncShared();
  }, []);

  /**
   * Setup background or foreground operations according to app state.
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      //If app has come to the foreground.
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        performBackgroundToForegroundOperations();
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

  if (initialLoad) {
    return <></>;
  }

  return (
    <>
      <Provider store={store}>
        <ThemeProvider>
          <SafeAreaProvider>
            <NavigationContainer>
              <ErrorModalProvider>
                <ToastProvider>
                  <LoginStack startOnboarding={profileExists} />
                  <Toast />
                  <ErrorModal />
                </ToastProvider>
              </ErrorModalProvider>
            </NavigationContainer>
          </SafeAreaProvider>
        </ThemeProvider>
      </Provider>
    </>
  );
}

export default App;
