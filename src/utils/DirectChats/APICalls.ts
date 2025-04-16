import axios from 'axios';

import { LINE_MANAGEMENT_RESOURCE } from '@configs/api';

import { getToken } from '@utils/ServerAuth';

export async function disconnectChat(lineId: string) {
  try {
    const token = await getToken();
    await axios.patch(
      LINE_MANAGEMENT_RESOURCE,
      {
        lineId: lineId,
      },
      { headers: { Authorization: `${token}` } },
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
