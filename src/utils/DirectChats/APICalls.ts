import axios from 'axios';

import {LINE_MANAGEMENT_RESOURCE, LINE_RETRY_URL} from '@configs/api';

import {getToken} from '@utils/ServerAuth';

import {IntroMessage} from './DirectChat';

interface newLineData {
  lineId: string;
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
    const lineId: string = response.data.newLine;
    const pairHash: string = response.data.pairHash;
    return {lineId, pairHash};
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
    const lineId: string = response.data.newLine;
    const pairHash: string = response.data.pairHash;
    return {lineId, pairHash};
  }
  throw new Error('APIError');
}

export async function newDirectChatFromContactPort(
  contactPortId: string,
  introMessage: IntroMessage,
  ticket: string,
): Promise<newLineData> {
  const token = await getToken();
  const response = await axios.post(
    LINE_MANAGEMENT_RESOURCE,
    {
      ticket: ticket,
      contactPortId: contactPortId,
      introMessage: introMessage,
    },
    {headers: {Authorization: `${token}`}},
  );
  if (response.data.newLine) {
    const lineId: string = response.data.newLine;
    const pairHash: string = response.data.pairHash;
    return {lineId, pairHash};
  }
  throw new Error('APIError');
}

export async function disconnectChat(lineId: string) {
  try {
    const token = await getToken();
    await axios.patch(
      LINE_MANAGEMENT_RESOURCE,
      {
        lineId: lineId,
      },
      {headers: {Authorization: `${token}`}},
    );
  } catch (error: any) {
    if (typeof error === 'object' && error?.response) {
      if (error.response?.status === 404) {
        return;
      }
    }
    throw new Error('NetworkError');
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
