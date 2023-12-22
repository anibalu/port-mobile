import axios from 'axios';
import {getToken} from '../ServerAuth';
import {QUEUE_GET_URL} from '../../configs/api';
import {ServerAuthToken} from '../ServerAuth/interfaces';
import ReceiveMessage from './Receive/ReceiveMessage';

/**
 * Pull messages from the backlog and process them
 */
export default async function pullBacklog() {
  const token: ServerAuthToken = await getToken();
  const messages = (
    await axios.get(QUEUE_GET_URL, {headers: {Authorization: `${token}`}})
  ).data;
  for (const message of messages) {
    console.log('invoking receiver for: ', message);
    const receiver = new ReceiveMessage(message);
    await receiver.receive();
    //TODO: This needs to be removed in a future refactor
    // const firstParse = JSON.parse(message);
    // await receiveMessage({data: firstParse});
  }
}
