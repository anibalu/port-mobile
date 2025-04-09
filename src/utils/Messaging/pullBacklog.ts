import ReceiveMessage from './Receive/ReceiveMessage';
import * as API from './APICalls';
import store from '@store/appStore';
import {getToken} from '@utils/ServerAuth';
import {WEBSOCKET_URL} from '@configs/api';
import {Mutex} from 'async-mutex';
import {isIOS} from '@components/ComponentUtils';
import {getUnprocessedMessages} from '@utils/Storage/unprocessedMessages';

// Used to ensure that the device doesn't concurrently pull the user's message backlog
const backlogLock = new Mutex();

/**
 * Retrieve messages from the backlog and process them
 */
export default async function pullBacklog() {
  // If we're already fetching messsages, return since the message that triggered this
  // pullBacklog will get fetched. There is a minor race condition that we can safely ignore.
  if (backlogLock.isLocked()) {
    console.log('[PULL BACKLOG] skipping since already performing fetch');
    return;
  }
  backlogLock.acquire();
  // Process messages cached locally
  await processLocallyCachedMessages();

  if (process.env.LEGACY === 'TRUE') {
    await _backlogPullWithREST();
  } else {
    try {
      await backlogPullWithWS();
    } catch (e) {
      console.error('[PULL BACKLOG]', e);
    }
  }
  backlogLock.release();
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

/**
 * Process any locally cached messages if it is run on iOS
 */
async function processLocallyCachedMessages() {
  if (!isIOS) {
    // There is no NSE on android to add messages to the
    // local cache
    return;
  }
  const messages = await getUnprocessedMessages();
  for (const message of messages) {
    const receiver = new ReceiveMessage(message);
    await receiver.receive();
  }
  store.dispatch({
    type: 'PING',
    payload: 'PONG',
  });
}

/**
 * Retrieve messages from the server over the WebSocket protocol
 */
async function backlogPullWithWS(): Promise<void> {
  /**
   * If a message gets processed from the local cache,
   * it will almost certainly be processed again once we fetch from the backlog on our servers.
   * As such, it is important to guard against duplicate processing for
   * some message types to prevent unwanted behaviour. This is handled
   * within receivers.
   */

  // Attempt to acquire a token immediately to prevent connections that never authenticate
  return new Promise(async (resolve, reject) => {
    let token: string;
    try {
      token = await getToken();
    } catch (e) {
      console.error('Could not get token to fetch messages', e);
      reject('Could not get token to fetch backlog');
      return;
    }

    let ws: WebSocket;
    try {
      ws = new WebSocket(WEBSOCKET_URL);
    } catch (e) {
      console.error('Could not open websocket', e);
      reject('Could not connect to websocket to fetch messages');
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
      reject(
        `An error occured while processing pulling the backlog ${e.message}`,
      );
    };

    ws.onclose = response => {
      // connection closed
      open = false;
      if (response.code !== 1000) {
        console.log(response.code, response.reason);
      }
      console.log(
        `WS connection closed. Proccessed ${ctr} batches of messages.`,
      );
      resolve();
    };
  });
}
