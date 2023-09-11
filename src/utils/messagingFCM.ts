import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import {INITIAL_POST_MANAGEMENT_RESOURCE} from '../configs/api';
import {getToken} from './Token';
import {Store} from '@reduxjs/toolkit';
import {DirectMessaging} from './DirectMessaging';

const FCM = messaging();

export const getFCMToken = async () => {
  const token = await FCM.getToken();
  return token;
};

export const registerBackgroundMessaging = (store: Store) => {
  FCM.setBackgroundMessageHandler(async remoteMessage => {
    //handling message
    console.log('handling message: (fmh)', remoteMessage);
    const lineId: string = remoteMessage.data.lineId;
    const messaging = new DirectMessaging(lineId);
    await messaging.receiveMessage(remoteMessage, store);
  });
};

export const foregroundMessageHandler = (store: Store) => {
  FCM.onMessage(async remoteMessage => {
    //handling message
    console.log('handling message: (fmh)', remoteMessage);
    const lineId: string = remoteMessage.data.lineId;
    const messaging = new DirectMessaging(lineId);
    await messaging.receiveMessage(remoteMessage, store);
  });
};

export const patchFCMToken = async (tokenFCM: string) => {
  try {
    const token = await getToken();
    if (token === null) {
      throw new Error('tokenGenerationError');
    } else {
      const response = await axios.patch(INITIAL_POST_MANAGEMENT_RESOURCE, {
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
