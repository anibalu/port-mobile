import messaging from '@react-native-firebase/messaging';
import {Alert} from 'react-native';
import axios from 'axios';
import {INITIAL_POST_MANAGEMENT_API} from '../configs/api';
import {getToken} from './Token';

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

export const patchFCMToken = async (tokenFCM: string) => {
  try {
    const token = await getToken();
    if (token === null) {
      throw new Error('tokenGenerationError');
    } else {
      const response = await axios.patch(INITIAL_POST_MANAGEMENT_API, {
        token: token,
        fcmtoken: tokenFCM,
      });
      return response.data;
    }
  } catch (error) {
    console.log('patch FCM token failed with error: ', error);
    return null;
  }
};
