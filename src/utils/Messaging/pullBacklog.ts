import ReceiveMessage from './Receive/ReceiveMessage';
import * as API from './APICalls';

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
  } catch (error) {
    console.log('error pulling backlog: ', error);
  }
}
