import {INITIAL_POST_MANAGEMENT_RESOURCE} from '@configs/api';
import {getToken} from '@utils/ServerAuth';
import axios from 'axios';
import _ from 'lodash';

export const patchFCMToken = async (tokenFCM: string) => {
  try {
    const token = await getToken();
    if (_.isNil(token)) {
      throw new Error('tokenGenerationError');
    } else {
      const response = await axios.patch(
        INITIAL_POST_MANAGEMENT_RESOURCE,
        {
          fcmtoken: tokenFCM,
        },
        {headers: {Authorization: `${token}`}},
      );
      return response.data;
    }
  } catch (error) {
    console.log('patch FCM token failed with error: ', error);
    return null;
  }
};
