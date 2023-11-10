import {ReceiveStatus} from './interfaces';
import {receiveDirectMessage} from './receiveDirectMessage';
import {receiveGroupMessage} from './receiveGroupMessage';

export async function receiveMessage(messageFCM: any): Promise<ReceiveStatus> {
  if (messageFCM.data.group) {
    return await receiveGroupMessage(messageFCM);
  } else {
    return await receiveDirectMessage(messageFCM);
  }
}
