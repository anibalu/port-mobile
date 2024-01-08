import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import pullBacklog from '../pullBacklog';
import * as API from './APICalls';
import _ from 'lodash';

export const getFCMToken = async () => {
  const token = await messaging().getToken();
  return token;
};

export const registerBackgroundMessaging = () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('[NEW BACKGROUND MESSAGE]');
    await pullBacklog();
    if (remoteMessage.messageId) {
      console.log(remoteMessage.messageId);
      await notifee.cancelNotification(remoteMessage.messageId);
    }
  });
};

export const foregroundMessageHandler = () => {
  messaging().onMessage(async remoteMessage => {
    console.log('[NEW FOREGROUND MESSAGE] ', remoteMessage);
    await notifee.cancelAllNotifications();
    await pullBacklog();
    await notifee.cancelAllNotifications();
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
