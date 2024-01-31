import messaging from '@react-native-firebase/messaging';
import {showDefaultNotification} from '@utils/Notifications';
import _ from 'lodash';
import pullBacklog from '../pullBacklog';
import * as API from './APICalls';

export const getFCMToken = async () => {
  const token = await messaging().getToken();
  return token;
};

/**
 * Background FCM handler.
 * Payload is ignored, as pullBacklog is used to make an API call to fetch relevant messages
 */
export const registerBackgroundMessaging = (): void => {
  messaging().setBackgroundMessageHandler(async () => {
    console.log('[NEW BACKGROUND MESSAGE]');
    await pullBacklog().catch((e: any) => {
      console.log('Error in background message handler: ', e);
      showDefaultNotification();
    });
  });
};

/**
 * Foreground FCM handler, does the same as background.
 */
export const foregroundMessageHandler = () => {
  messaging().onMessage(async _ => {
    console.log('[NEW FOREGROUND MESSAGE] ');
    await pullBacklog().catch((e: any) => {
      console.log('Error in background message handler: ', e);
      showDefaultNotification();
    });
  });
};

export async function initialiseFCM(): Promise<boolean> {
  const tokenFCM = await getFCMToken();
  const response = await API.patchFCMToken(tokenFCM);
  console.log('[FCM TOKEN POST] ', response);
  if (_.isNil(response)) {
    return false;
  }
  return true;
}
