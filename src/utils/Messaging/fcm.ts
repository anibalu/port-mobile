import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import store from '../../store/appStore';
import {INITIAL_POST_MANAGEMENT_RESOURCE} from '../../configs/api';
import {receiveMessage} from './receiveMessage';
import {getToken} from '../ServerAuth';

export const getFCMToken = async () => {
  const token = await messaging().getToken();
  return token;
};

export const registerBackgroundMessaging = () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    await receiveMessage(remoteMessage);
    store.dispatch({type: 'NEW_MESSAGE', payload: remoteMessage});
  });
};

export const foregroundMessageHandler = () => {
  messaging().onMessage(async remoteMessage => {
    await receiveMessage(remoteMessage);
    store.dispatch({type: 'NEW_MESSAGE', payload: remoteMessage});
  });
};

export const patchFCMToken = async (tokenFCM: string) => {
  try {
    const token = await getToken(true);
    if (token === null) {
      throw new Error('tokenGenerationError');
    } else {
      const response = await axios.patch(
        INITIAL_POST_MANAGEMENT_RESOURCE,
        {
          fcmtoken: tokenFCM,
        },
        {headers: {Authorization: `${token}`}},
      );
      return response.data;
    }
  } catch (error) {
    console.log('patch FCM token failed with error: ', error);
    return null;
  }
};

export async function initialiseFCM(): Promise<boolean> {
  const tokenFCM = await getFCMToken();
  const response = await patchFCMToken(tokenFCM);
  if (response === null) {
    return false;
  }
  return true;
}
