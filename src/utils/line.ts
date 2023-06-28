import {LINE_MANAGEMENT_RESOURCE} from '../configs/api';
import {getToken} from './Token';
import axios from 'axios';

export async function createLine(lineLink: string) {
  try {
    const token = await getToken();
    if (token) {
      const response = await axios.post(LINE_MANAGEMENT_RESOURCE, {
        token: token,
        lineLinkId: lineLink,
      });
      return response.data;
    }
    throw new Error('TokenError');
  } catch (error) {
    console.error('Error getting line:', error);
    return null;
  }
}
