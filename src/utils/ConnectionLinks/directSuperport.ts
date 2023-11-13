import axios from 'axios';
import {getToken} from '../ServerAuth';
import {LINE_SUPERPORT_MANAGEMENT_RESOURCE} from '../../configs/api';

/**
 * asks the server for new direct connection superport.
 * @returns {Promise<string | null>} - new direct connection superport or null
 */
export async function getNewDirectConnectionSuperport(): Promise<
  string | null
> {
  try {
    const token = await getToken(true);
    const response = await axios.post(LINE_SUPERPORT_MANAGEMENT_RESOURCE, {
      token: token,
    });
    if (response.data.NewSuperPort) {
      const superport = response.data.NewSuperPort;
      return superport;
    } else {
      throw new Error('Unable to create superport');
    }
  } catch (error) {
    console.log('Error getting direct connection superport:', error);
    return null;
  }
}
