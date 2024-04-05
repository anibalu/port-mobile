import ReceiveMessage from './Receive/ReceiveMessage';
import * as API from './APICalls';
import store from '@store/appStore';

/**
 * Pull messages from the backlog and process them
 */
export default async function pullBacklog() {
  try {
    const messages = await API.getMessages();
    for (const message of messages) {
      const receiver = new ReceiveMessage(message);
      await receiver.receive();
    }
    // Trigger a single redraw after ALL messages have been received
    store.dispatch({
      type: 'PING',
      payload: 'PONG',
    });
  } catch (error) {
    console.log('error pulling backlog: ', error);
  }
}
