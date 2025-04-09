import axios from 'axios';

import {QUEUE_GET_URL} from '@configs/api';

import {getToken} from '@utils/ServerAuth';
import {ServerAuthToken} from '@utils/Storage/RNSecure/secureTokenHandler';

export async function getMessages(): Promise<Array<any>> {
  const token: ServerAuthToken = await getToken();

  const response = await axios.get(QUEUE_GET_URL, {
    headers: {Authorization: `${token}`},
  });
  if (response.data) {
    return response.data;
  }
  throw new Error('NoResponseDataInGetMessages');
}
