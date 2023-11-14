import axios from 'axios';
import {getToken} from '../ServerAuth';
import {QUEUE_GET_URL} from '../../configs/api';
import {ServerAuthToken} from '../ServerAuth/interfaces';

/**
 * Pull messages from the backlog and process them
 */
export default async function pullBacklog() {
  const token: ServerAuthToken = await getToken();
  const messages = (
    await axios.get(QUEUE_GET_URL, {headers: {Authorization: `${token}`}})
  ).data;
  console.log('pulled: ', messages);
}
