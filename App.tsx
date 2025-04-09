/**
 * Numberless Inc's messaging client app Port.
 * This screen is responsible for:
 * 1. Sets up Root Stack to decide if the user needs to be navigated to Onboarding or Home (based on if profile is setup)
 * 2. Sets up background operations and periodic foreground operations
 */

import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';

import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import store from './src/store/appStore';

import {
  initialiseFCM,
  foregroundMessageHandler,
} from '@utils/Messaging/PushNotifications/fcm';

import {RootStack} from '@navigation/RootStack';
import {checkProfileCreated} from '@utils/Profile';
import {ProfileStatus} from '@utils/Storage/RNSecure/secureProfileHandler';

import {addEventListener} from '@react-native-community/netinfo';
import {
  backgroundToForegroundOperations,
  performDebouncedCommonAppOperations,
} from '@utils/AppOperations';
import {AppState} from 'react-native';
import {ThemeProvider} from 'src/context/ThemeContext';
import {ToastProvider} from 'src/context/ToastContext';
import Toast from '@components/Modals/Toast';
import SoftUpdateInfoBlurView from '@components/Reusable/BlurView/SoftUpdateInfoBlurView';
import HardUpdateInfoBlurView from '@components/Reusable/BlurView/HardUpdateInfoBlurView';
import {UpdateStatusProvider} from 'src/context/UpdateStatusContext';
import {wait} from '@utils/Time';
import runMigrations from '@utils/Storage/Migrations';
import BootSplash from 'react-native-bootsplash';
import {rootNavigationRef} from '@navigation/rootNavigation';

function App(): JSX.Element {
  const appState = useRef(AppState.currentState);

  const [profileStatus, setProfileStatus] = useState<ProfileStatus>(
    ProfileStatus.unknown,
  );

  //checks if profile setup is done
  const readinessChecks = async () => {
    console.log('readinessChecks');
    try {
      //need to run before anything else
      await runMigrations();
      //can be run asynchronously
      initialiseFCM();
      //checks if profile setup is done
      setProfileStatus(await checkProfileCreated());
    } catch (error) {
      console.error('Error in readinessChecks', error);
    }
  };

  useEffect(() => {
    readinessChecks();
    // default way to handle new messages in the foreground
    foregroundMessageHandler();
  }, []);

  useEffect(() => {
    if (rootNavigationRef.isReady()) {
      console.log('Navigation ref ready');
      if (profileStatus !== ProfileStatus.unknown) {
        if (profileStatus === ProfileStatus.created) {
          rootNavigationRef.navigate('AppStack');
        } else if (profileStatus === ProfileStatus.failed) {
          rootNavigationRef.navigate('OnboardingStack');
        }
        wait(300).then(() => {
          BootSplash.hide({fade: false});
        });
      }
    } else {
      console.log('Navigation ref not ready');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileStatus, rootNavigationRef.isReady()]);

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
        backgroundToForegroundOperations();
      }

      appState.current = nextAppState;
    });
    // Detects app going online-offline.
    const unsubscribe = addEventListener(state => {
      //Performs operation if the app is connected to any valid network (might not have internet access though)
      if (state.isConnected) {
        performDebouncedCommonAppOperations();
      }
    });
    return () => {
      subscription.remove();
      unsubscribe();
    };
  }, []);

  return (
    <>
      <Provider store={store}>
        <ThemeProvider>
          <UpdateStatusProvider>
            <SafeAreaProvider>
              <ToastProvider>
                <NavigationContainer ref={rootNavigationRef}>
                  <RootStack />
                </NavigationContainer>
                <Toast />
                <SoftUpdateInfoBlurView />
                <HardUpdateInfoBlurView />
              </ToastProvider>
            </SafeAreaProvider>
          </UpdateStatusProvider>
        </ThemeProvider>
      </Provider>
    </>
  );
}

export default App;
