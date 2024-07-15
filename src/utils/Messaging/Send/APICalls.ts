import {ServerAuthToken} from '@utils/ServerAuth/interfaces';
import {getToken} from '@utils/ServerAuth';
import axios from 'axios';
import {
  DIRECT_MESSAGING_RESOURCE,
  GROUP_MESSAGING_RESOURCE,
} from '@configs/api';

/**
 * API call to send a payload
 * @param chatId
 * @param processedPayload - payload string to send
 * @param isGroup
 * @param silent - if push notification should be silenced. default is false.
 */
export async function sendObject(
  chatId: string,
  processedPayload: object,
  isGroup: boolean,
  silent: boolean = false,
): Promise<void> {
  const token: ServerAuthToken = await getToken();
  if (isGroup) {
    //post to group messaging resource
    await axios.post(
      GROUP_MESSAGING_RESOURCE,
      {
        type: 'group',
        message_mapping: processedPayload,
        chat: chatId,
      },
      {headers: {Authorization: `${token}`}},
    );
  } else {
    //post to direct messaging resource
    await axios.post(
      DIRECT_MESSAGING_RESOURCE,
      {
        message: processedPayload,
        line: chatId,
        silent,
      },
      {headers: {Authorization: `${token}`}},
    );
  }
}
