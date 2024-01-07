/**
 * Numberless Inc's messaging client app Port
 */

import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';

import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import store from './src/store/appStore';

import {
  foregroundMessageHandler,
  registerBackgroundMessaging,
} from '@utils/Messaging/FCM/fcm';

import runMigrations from './src/utils/Storage/Migrations';

runMigrations();

import ErrorModal from '@components/ErrorModal';
import LoginStack from '@navigation/LoginStack';
import {loadConnectionsToStore} from '@utils/Connections';
import pullBacklog from '@utils/Messaging/pullBacklog';
import {checkProfileCreated} from '@utils/Profile';
import {ProfileStatus} from '@utils/Profile/interfaces';
import Toast from 'react-native-toast-message';
import {ErrorModalProvider} from 'src/context/ErrorModalContext';
import BootSplash from 'react-native-bootsplash';
import {Text, TextInput} from 'react-native';
// import DeviceInfo from 'react-native-device-info';

// This prevents any and all Text and TextInput from being scaled beyond 1.2X their current size on Android and iOS
interface TextWithDefaultProps extends Text {
  defaultProps?: {maxFontSizeMultiplier?: number};
}

interface TextInputWithDefaultProps extends TextInput {
  defaultProps?: {maxFontSizeMultiplier?: number};
}

(Text as unknown as TextWithDefaultProps).defaultProps =
  (Text as unknown as TextWithDefaultProps).defaultProps || {};
(
  Text as unknown as TextWithDefaultProps
).defaultProps!.maxFontSizeMultiplier = 1.2;
(TextInput as unknown as TextInputWithDefaultProps).defaultProps =
  (TextInput as unknown as TextInputWithDefaultProps).defaultProps || {};
(
  TextInput as unknown as TextInputWithDefaultProps
).defaultProps!.maxFontSizeMultiplier = 1.2;

function App(): JSX.Element {
  //check if initial setup is done, and accordingly decides which flow to render on app start
  const [initialLoad, setInitialLoad] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const profileCheck = async () => {
    try {
      const result = await checkProfileCreated();
      if (result === ProfileStatus.created) {
        setProfileExists(true);
        await loadConnectionsToStore();
        await pullBacklog();
      }
      setInitialLoad(false);
    } catch (error) {
      console.log('Error checking profile:', error);
      setInitialLoad(false);
    } finally {
      await BootSplash.hide({fade: true});
    }
  };
  useEffect(() => {
    profileCheck();
    // default way to handle new messages in the foreground
    foregroundMessageHandler();
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
  //set up background message handler here
  registerBackgroundMessaging();

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
