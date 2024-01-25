/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {registerBackgroundMessaging} from '@utils/Messaging/FCM/fcm';
import runMigrations from './src/utils/Storage/Migrations';
import {Text, TextInput} from 'react-native';

/**
 * Prevents accessibility text from expanding beyond what the app can comfortably render
 */
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.maxFontSizeMultiplier = 1.2;
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.maxFontSizeMultiplier = 1.2;

runMigrations();

//set up background message handler here
registerBackgroundMessaging();

// Check if app was launched in the background and conditionally render null if so
function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  // Render the app component on foreground launch
  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
