import store from '@store/appStore';
import {ReceiveStatus} from './interfaces';
import {receiveDirectMessage} from './receiveDirectMessage';
import {receiveGroupMessage} from './receiveGroupMessage';

export async function receiveMessage(receivedMsg: any): Promise<void> {
  let receiveStatus = ReceiveStatus.failed;
  if (receivedMsg.data.group) {
    console.log('doing group processing');
    receiveStatus = await receiveGroupMessage(receivedMsg);
  } else {
    console.log('doing line processing');
    receiveStatus = await receiveDirectMessage(receivedMsg);
  }
  //update store that a new message has been received
  if (receiveStatus === ReceiveStatus.success) {
    store.dispatch({type: 'NEW_RECEIVED_MESSAGE', payload: receivedMsg});
  }
}
