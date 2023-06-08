import {LINE_MANAGEMENT_API} from '../configs/api';
import {getToken} from './Token';
import axios from 'axios';

export async function createLine(lineLink: string): Promise<string[] | null> {
    try {
      const token = await getToken();
      if (token) {
        const response = await axios.post(LINE_MANAGEMENT_API, {
          token: token,
          lineLinkId: lineLink
        });
        const newLine: string[] = response.data;
        return newLine;
      }
      throw new Error('TokenError');
    } catch (error) {
      console.error('Error getting line:', error);
      return null;
    }
  }