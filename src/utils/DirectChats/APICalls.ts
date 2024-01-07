import {LINE_MANAGEMENT_RESOURCE} from '@configs/api';
import {getToken} from '@utils/ServerAuth';
import axios from 'axios';

export async function newDirectChatFromPort(linkId: string): Promise<string> {
  const token = await getToken();
  const response = await axios.post(
    LINE_MANAGEMENT_RESOURCE,
    {
      lineLinkId: linkId,
    },
    {headers: {Authorization: `${token}`}},
  );
  if (response.data.newLine) {
    const chatId: string = response.data.newLine;
    return chatId;
  }
  throw new Error('APIError');
}

export async function newDirectChatFromSuperport(
  superportId: string,
): Promise<string> {
  const token = await getToken();
  const response = await axios.post(
    LINE_MANAGEMENT_RESOURCE,
    {
      lineSuperportId: superportId,
    },
    {headers: {Authorization: `${token}`}},
  );
  if (response.data.newLine) {
    const chatId: string = response.data.newLine;
    return chatId;
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
