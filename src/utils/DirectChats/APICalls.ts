import {LINE_MANAGEMENT_RESOURCE, LINE_RETRY_URL} from '@configs/api';
import {getToken} from '@utils/ServerAuth';
import axios from 'axios';
import {IntroMessage} from './DirectChat';

interface newLineData {
  chatId: string;
  pairHash: string;
}
export async function newDirectChatFromPort(
  linkId: string,
  introMessage: IntroMessage,
): Promise<newLineData> {
  const token = await getToken();
  const response = await axios.post(
    LINE_MANAGEMENT_RESOURCE,
    {
      lineLinkId: linkId,
      introMessage,
    },
    {headers: {Authorization: `${token}`}},
  );

  if (response.data.newLine) {
    const chatId: string = response.data.newLine;
    const pairHash: string = response.data.pairHash;
    return {chatId, pairHash};
  }
  throw new Error('APIError');
}

export async function newDirectChatFromSuperport(
  superportId: string,
  introMessage: IntroMessage,
): Promise<newLineData> {
  const token = await getToken();
  const response = await axios.post(
    LINE_MANAGEMENT_RESOURCE,
    {
      lineSuperportId: superportId,
      introMessage,
    },
    {headers: {Authorization: `${token}`}},
  );
  if (response.data.newLine) {
    const chatId: string = response.data.newLine;
    const pairHash: string = response.data.pairHash;
    return {chatId, pairHash};
  }
  throw new Error('APIError');
}

export async function disconnectChat(chatId: string) {
  try {
    const token = await getToken();
    await axios.patch(
      LINE_MANAGEMENT_RESOURCE,
      {
        lineId: chatId,
      },
      {headers: {Authorization: `${token}`}},
    );
    return true;
  } catch (error: any) {
    if (typeof error === 'object' && error.response) {
      if (error.response.status === 404) {
        return true;
      }
    }
    return false;
  }
}

export async function retryDirectChatFromPort(
  lineId: string,
): Promise<boolean> {
  try {
    const token = await getToken();
    await axios.post(
      LINE_RETRY_URL,
      {
        lineId: lineId,
      },
      {headers: {Authorization: `${token}`}},
    );
    return true;
  } catch (error) {
    console.log('Error while retrying from port:', error);
    return false;
  }
}
