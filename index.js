/**
 * @format
 */

import {AppRegistry, LogBox, Text, TextInput} from 'react-native';

import {DEMO_MODE} from '@env';

import {initBackgroundFetch} from '@utils/BackgroundOperations/backgroundFetch';

import App from './App';
import {name as appName} from './app.json';
import {registerBackgroundMessaging} from './src/utils/Messaging/PushNotifications/fcm';

if (DEMO_MODE === 'true') {
  LogBox.ignoreAllLogs();
}

initBackgroundFetch();

/**
 * Prevents accessibility text from expanding beyond what the app can comfortably render
 */
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.maxFontSizeMultiplier = 1.2;
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.maxFontSizeMultiplier = 1.2;

//set up background message handler here
registerBackgroundMessaging();

// Check if app was launched in the background and conditionally render null if so
function HeadlessCheck({isHeadless}) {
  // We disable the headless check for now, There are issues with the check when coming in
  // from clicking on a notification
  // eslint-disable-next-line no-undef
  console.log(isHeadless);
  // Render the app component on foreground launch
  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
