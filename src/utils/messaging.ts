import messaging from '@react-native-firebase/messaging';
import {Alert} from 'react-native';

export const getFCMToken = async () => {
  // const token = await messaging.getToken()
  const token = await messaging().getToken();
  console.log(token);
  return token;
};

export const registerBackgroundMessaging = async () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('remote message: ', remoteMessage);
  });
};

export const foregroundMessageHandler = () => {
  const unsub = messaging().onMessage(async remoteMessage => {
    Alert.alert('Foreground message: ', JSON.stringify(remoteMessage));
  });
  return unsub;
};
