import axios from 'axios';

import {CALL_PERMISSIONS_MANAGEMENT, TURN_SERVER_URL} from '@configs/api';

import {getToken} from '@utils/ServerAuth';

type RTCIceServer = {
  credential?: string;
  url?: string;
  urls?: string | string[];
  username?: string;
};

type RTCConfiguration = {
  bundlePolicy?: 'balanced' | 'max-compat' | 'max-bundle';
  iceCandidatePoolSize?: number;
  iceServers?: RTCIceServer[];
  iceTransportPolicy?: 'all' | 'relay';
  rtcpMuxPolicy?: 'negotiate' | 'require';
};

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

/**
 * Modify the call permissions for the given chatId.
 */
export async function modifyCallPermission(
  lineId: string,
  permission: boolean,
) {
  const token = await getToken();
  await axios.patch(
    CALL_PERMISSIONS_MANAGEMENT,
    {
      calls: permission,
      chats: [
        {
          id: lineId,
          type: 'line',
        },
      ],
    },
    {headers: {Authorization: token}},
  );
}
