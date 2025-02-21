import {INITIAL_POST_MANAGEMENT_RESOURCE} from '@configs/api';
import {getToken} from '@utils/ServerAuth';
import axios from 'axios';

export const patchFCMToken = async (tokenFCM: string) => {
  const token = await getToken();
  await axios.patch(
    INITIAL_POST_MANAGEMENT_RESOURCE,
    {
      fcmtoken: tokenFCM,
    },
    {headers: {Authorization: `${token}`}},
  );
};

export const patchTokens = async (tokenFCM: string, APNStoken: string) => {
  const token = await getToken();
  await axios.patch(
    INITIAL_POST_MANAGEMENT_RESOURCE,
    {
      fcmtoken: tokenFCM,
      apnstoken: APNStoken,
    },
    {headers: {Authorization: `${token}`}},
  );
};

export const patchToken = async (
  tokenType: 'apnstoken' | 'fcmtoken',
  tokenVal: string,
) => {
  const token = await getToken();
  try {
    await axios.patch(
      INITIAL_POST_MANAGEMENT_RESOURCE,
      {
        [tokenType]: tokenVal,
      },
      {headers: {Authorization: `${token}`}},
    );
  } catch (e) {
    console.warn('Error patching API call for apns: ', e);
    throw e;
  }
};
