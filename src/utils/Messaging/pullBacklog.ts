import ReceiveMessage from './Receive/ReceiveMessage';
import * as API from './APICalls';
import store from '@store/appStore';
import {getToken} from '@utils/ServerAuth';
import {WEBSOCKET_URL} from '@configs/api';
import {Mutex} from 'async-mutex';

/**
 * Retrieve messages from the backlog and process them
 */
export default async function pullBacklog() {
  if (process.env.LEGACY === 'TRUE') {
    await _backlogPullWithREST();
  } else {
    await backlogPullWithWS();
  }
}

/**
 * @deprecated due to reliability. Relaced by backlogPullWithWS
 * Use legacy pull backlog REST API to receive messages
 */
async function _backlogPullWithREST() {
  try {
    const messages = await API.getMessages();
    for (const message of messages) {
      const receiver = new ReceiveMessage(message);
      await receiver.receive();
    }
  } catch (error) {
    console.log('error pulling backlog: ', error);
  }
  // Trigger a single redraw after ALL messages have been received
  store.dispatch({
    type: 'PING',
    payload: 'PONG',
  });
}

const backlogLock = new Mutex();

/**
 * Retrieve messages from the server over the WebSocket protocol
 */
async function backlogPullWithWS() {
  // Attempt to acquire a token immediately to prevent connections that never authenticate
  var token: string;
  try {
    token = await getToken();
  } catch (e) {
    console.error('Could not get token to fetch messages', e);
    return;
  }

  // If we're already fetching messsages, return since the message that triggered this
  // pullBacklog will get fetched. There is a minor race condition that we can safely ignore.
  if (backlogLock.isLocked()) {
    return;
  }

  var ws: WebSocket;
  backlogLock.acquire();
  try {
    ws = new WebSocket(WEBSOCKET_URL);
  } catch (e) {
    console.error('Could not open websocket', e);
    backlogLock.release();
    return;
  }
  let ctr = 0;
  let open = true;

  ws.onopen = async () => {
    // Authenticate yourself as soon as the connection is open
    ws.send(token);
  };

  ws.onmessage = async server_message => {
    const messages: string[] = JSON.parse(server_message.data);
    for (const message of messages) {
      const receiver = new ReceiveMessage(message);
      await receiver.receive();
    }
    store.dispatch({
      type: 'PING',
      payload: 'PONG',
    });
    if (open) {
      ws.send(messages.length.toString());
      ctr += 1;
    }
  };

  ws.onerror = async e => {
    // an error occurred
    console.error(e.message);
  };

  ws.onclose = response => {
    // connection closed
    open = false;
    backlogLock.release();
    if (response.code !== 1000) {
      console.log(response.code, response.reason);
    }
    console.log(`WS connection closed. Proccessed ${ctr} batches of messages.`);
  };
}
