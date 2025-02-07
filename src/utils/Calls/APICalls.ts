import {TURN_SERVER_URL} from '@configs/api';
import {getToken} from '@utils/ServerAuth';
import axios from 'axios';
import {RTCConfiguration} from './PortRTCPeerConnection';

/**
 * Return stun and turn server configs to setup peer connection.
 */
export async function getPeerRtcConfig(): Promise<RTCConfiguration> {
  const token = await getToken();
  // We set our STUN and TURN servers here
  const peerConnectionConfig: RTCConfiguration = (
    await axios.get(TURN_SERVER_URL, {
      headers: {
        Authorization: token,
      },
    })
  ).data;
  if (!peerConnectionConfig) {
    throw new Error('Error getting peer connection config');
  }
  return peerConnectionConfig;
}
