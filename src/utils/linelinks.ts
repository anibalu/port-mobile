import {LINE_LINKS_MANAGEMENT_API} from '../configs/api';
import {getToken} from './Token';
import axios from 'axios';

export async function getNewLineLinks(): Promise<string[] | null> {
  try {
    const token = await getToken();
    if (token) {
      const response = await axios.post(LINE_LINKS_MANAGEMENT_API, {
        token: token,
      });
      const lineLinks: string[] = response.data;
      return lineLinks;
    }
    throw new Error('TokenError');
  } catch (error) {
    console.error('Error getting line links:', error);
    return null;
  }
}
