import messaging from '@react-native-firebase/messaging';
import pullBacklog from '../pullBacklog';
import * as API from './APICalls';

export const getFCMToken = async () => {
  const token = await messaging().getToken();
  return token;
};

export const registerBackgroundMessaging = () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    if (remoteMessage) {
    }
    console.log('receiving messages through fcm background');
    await pullBacklog();
  });
};

export const foregroundMessageHandler = () => {
  messaging().onMessage(async remoteMessage => {
    if (remoteMessage) {
    }
    console.log('receiving messages through fcm foreground');
    await pullBacklog();
  });
};

export async function initialiseFCM(): Promise<boolean> {
  const tokenFCM = await getFCMToken();
  const response = await API.patchFCMToken(tokenFCM);
  if (response === null) {
    return false;
  }
  return true;
}
