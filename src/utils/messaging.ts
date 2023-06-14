import messaging from '@react-native-firebase/messaging';
import {Alert} from 'react-native';
import axios from 'axios';
import {INITIAL_POST_MANAGEMENT_API, LINE_MESSAGING_API} from '../configs/api';
import {getToken} from './Token';
import { ConnectionType, addConnection, updateConnection } from './Connection';
import { readProfileNickname } from './Profile';

const FCM = messaging()

export const getFCMToken = async () => {
  // const token = await messaging.getToken()
  const token = await FCM.getToken();
  console.log(token);
  return token;
};

export const registerBackgroundMessaging = async () => {
  FCM.setBackgroundMessageHandler(async remoteMessage => {
    console.log('remote message: ', remoteMessage);
  });
};

export const defaultForegroundMessageHandler = () => {
  FCM.onMessage(async remoteMessage => {
    console.log("handling message: ", remoteMessage);
    await handleMessage(remoteMessage.data);
  });
};

export const screenForegroundMessageHandler = (triggerRender) => {
  const unsubscribe = FCM.onMessage(async remoteMessage => {
    console.log("screen handling message: ", remoteMessage);
    await triggerRender(remoteMessage.data);
  });
  return unsubscribe;
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

export const handleMessage = async (messageData) => {
  //new connection
  if (!messageData.messageContent && messageData.lineId && messageData.lineLinkId) {
    const now: Date = new Date();
    await addConnection({
      connectionType: ConnectionType.line,
      id: messageData.lineId,
      nickname: "",
      readStatus: "new",
      timeStamp: now.toISOString(),
    });
    const name = await readProfileNickname();
    console.log("sending nickname");
    await sendMessage({nickname: name}, messageData.lineId); 
  }
  //updating existing connection
  else {
    const content = JSON.parse(messageData.messageContent);
    if (content.nickname) {
      //update connection with nickname
      console.log("updating connection with recieved nickname");
      await updateConnection({id:messageData.lineId, nickname:content.nickname, readStatus:"new"});
    }
    //handle regular message
    else {
      if (content.text) {
        await updateConnection({id:messageData.lineId, text:content.text});
      }
    }
  }
}

export const sendMessage = async (messageContent:object, line: string) => {
  const token = await getToken();
  console.log(messageContent);
  const response = await axios.post(LINE_MESSAGING_API, {
    token: token,
    message: JSON.stringify(messageContent),
    line: line,
  });
  return response;
}