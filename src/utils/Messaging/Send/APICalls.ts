import {ServerAuthToken} from '@utils/ServerAuth/interfaces';
import {MessageStatus} from '../interfaces';
import {getToken} from '@utils/ServerAuth';
import axios from 'axios';
import {
  DIRECT_MESSAGING_RESOURCE,
  GROUP_MESSAGING_RESOURCE,
} from '@configs/api';

export async function sendObject(
  chatId: string,
  processedPayload: object,
  isGroup: boolean,
): Promise<MessageStatus.sent | MessageStatus.journaled> {
  try {
    const token: ServerAuthToken = await getToken();
    if (isGroup) {
      //post to group messaging resource
      await axios.post(
        GROUP_MESSAGING_RESOURCE,
        {
          type: 'group',
          message: processedPayload,
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
        },
        {headers: {Authorization: `${token}`}},
      );
    }
    return MessageStatus.sent;
  } catch (error) {
    console.log('Error in try sending operation: ', error);
    return MessageStatus.journaled;
  }
}
