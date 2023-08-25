import {preparedMessage} from './DirectMessaging';
import {getTokenAsync} from './Token';
import axios from 'axios';
import {LINE_MESSAGING_RESOURCE} from '../configs/api';
import {updateConnectionAsync} from './Connection';
import RNFS from 'react-native-fs';
import {messagesDir} from '../configs/paths';
import {initialiseMessagesDirAsync} from './messagefs';
import {connectionFsSync} from './syncronization';

const path = RNFS.DocumentDirectoryPath + '/' + messagesDir;
const ENCODING = 'utf8';

//initialise journaled messages file
async function initialiseJounaledMessagesFileAsync() {
  const journalPath = path + '/journaled.msgs';
  await initialiseMessagesDirAsync();
  if (await RNFS.exists(journalPath)) {
    return journalPath;
  }
  // write an empty list to the file
  await RNFS.writeFile(journalPath, '', ENCODING);
  return journalPath;
}

async function sendMessageAsync(message: preparedMessage) {
  const token = await getTokenAsync();
  await axios.post(LINE_MESSAGING_RESOURCE, {
    token: token,
    message: JSON.stringify(message.message),
    line: message.line,
  });
}

//try sending the message
async function trySendingAsync(message: preparedMessage) {
  //send message
  await sendMessageAsync(message);
  //if successful
  //TO DO: make this messageType dependent after handshake protocol changes
  if (message.message.messageId !== 'nan') {
    //TO DO: toggle message as sent
    //update connection on home screen
    await updateConnectionAsync({
      id: message.line,
      text: message.message.data.text || '',
      readStatus: 'sent',
    });
  }
}

//adds prepared message to send queue
async function addToSendQueueAsync(message: preparedMessage) {
  //initialize fs
  const journalPath = await initialiseJounaledMessagesFileAsync();
  //append to fs
  await RNFS.appendFile(journalPath, JSON.stringify(message) + '\n');
}

async function overwriteSendQueueAsync(queue: Array<preparedMessage>) {
  //initialize fs
  const journalPath = await initialiseJounaledMessagesFileAsync();
  await RNFS.writeFile(journalPath, '', ENCODING);
  for (let index = 0; index < queue.length; index++) {
    await RNFS.appendFile(journalPath, JSON.stringify(queue[index]) + '\n');
  }
}

async function readSendQueueAsync(): Promise<Array<preparedMessage>> {
  const journalPath = await initialiseJounaledMessagesFileAsync();
  const contents = await RNFS.readFile(journalPath, ENCODING);
  const messagesArray = contents.split('\n');
  if (messagesArray.length <= 1) {
    return [];
  } else {
    const parsedArray = messagesArray
      .slice(0, -1)
      .map(element => JSON.parse(element));
    return parsedArray;
  }
}

//try sending the message
export async function trySending(message: preparedMessage): Promise<void> {
  const synced = async () => {
    try {
      await trySendingAsync(message);
    } catch (error) {
      await addToSendQueueAsync(message);
    }
  };
  await connectionFsSync(synced);
}

//tries to empty send queue. If network fails, unsent message remain in the queue to be sent at a later time.
export async function emptySendQueue(): Promise<void> {
  const synced = async () => {
    const queuedMessages = await readSendQueueAsync();
    while (queuedMessages.length > 0) {
      try {
        await trySendingAsync(queuedMessages[0]);
      } catch (error) {
        await overwriteSendQueueAsync(queuedMessages);
        break;
      }
      queuedMessages.shift();
    }
  };
  await connectionFsSync(synced);
}
