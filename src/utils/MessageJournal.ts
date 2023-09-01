/**
 * This module contains helper functions that provide basic journaling functionality.
 * This basic journaling works by saving unsent messages to an unsent queue
 * We attempt to empty this queue periodically (queue is emptied when all unsent messages are sent)
 * Currently, attempt to empty unsent queue happens when we navigate to home screen.
 * We need to change this to a better way.
 * @module MessageJournal
 */
import {preparedMessage} from './DirectMessaging';
import {getTokenAsync, token} from './Token';
import axios from 'axios';
import {LINE_MESSAGING_RESOURCE} from '../configs/api';
import {updateConnectionAsync} from './Connection';
import RNFS from 'react-native-fs';
import {messagesDir} from '../configs/paths';
import {initialiseMessagesDirAsync} from './messagefs';
import {connectionFsSync} from './syncronization';

/**
 * Unsent messages queue is stored in the messages directory in a single file called "journaled.txt"
 */
const path = RNFS.DocumentDirectoryPath + '/' + messagesDir;
const ENCODING = 'utf8';

/**
 * Initializes the journalled messages file asynchronously.
 * This function prepares the journalled messages file, creating an empty file it if it doesn't exist,
 * and returns the path to the file.
 *
 * @returns {Promise<string>} A Promise that resolves to the path of the journalled messages file.
 */
async function initialiseJounaledMessagesFileAsync(): Promise<string> {
  const journalPath: string = path + '/journaled.txt';
  await initialiseMessagesDirAsync();
  if (await RNFS.exists(journalPath)) {
    return journalPath;
  }
  await RNFS.writeFile(journalPath, '', ENCODING);
  return journalPath;
}

/**
 * Sends a message asynchronously using the LINE Messaging API.
 *
 * @param {preparedMessage} message - The prepared message object to send.
 * @throws {Error} If there's an issue generating a valid token or sending the message.
 * @returns {Promise<void>} A Promise that resolves once the message is sent successfully.
 */
async function sendMessageAsync(message: preparedMessage): Promise<void> {
  const token: token | null = await getTokenAsync();
  if (token) {
    await axios.post(LINE_MESSAGING_RESOURCE, {
      token: token,
      message: JSON.stringify(message.message),
      line: message.line,
    });
  } else {
    throw new Error('TokenError');
  }
}

/**
 * Tries to send a message asynchronously and performs post-send actions if successful.
 *
 * @param {preparedMessage} message - The prepared message object to send.
 * @throws {Error} If there's an issue sending the message
 * @returns {Promise<void>} A Promise that resolves once the message is sent and post-send actions are completed.
 */
async function trySendingAsync(message: preparedMessage): Promise<void> {
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

/**
 * Adds a prepared message to the send queue asynchronously.
 *
 * @param {preparedMessage} message - The prepared message object to add to the unsent queue.
 * @returns {Promise<void>} A Promise that resolves once the message is added to the queue.
 */
async function addToSendQueueAsync(message: preparedMessage): Promise<void> {
  //initialize fs
  const journalPath: string = await initialiseJounaledMessagesFileAsync();
  //append to fs
  await RNFS.appendFile(journalPath, JSON.stringify(message) + '\n');
}

/**
 * Overwrites the send queue with a new set of prepared messages asynchronously.
 *
 * @param {Array<preparedMessage>} queue - The array of prepared messages to overwrite the send queue with.
 * @returns {Promise<void>} A Promise that resolves once the send queue is overwritten.
 */
async function overwriteSendQueueAsync(
  queue: Array<preparedMessage>,
): Promise<void> {
  //initialize fs
  const journalPath: string = await initialiseJounaledMessagesFileAsync();
  await RNFS.writeFile(journalPath, '', ENCODING);
  for (let index = 0; index < queue.length; index++) {
    await RNFS.appendFile(journalPath, JSON.stringify(queue[index]) + '\n');
  }
}

/**
 * Reads the send queue from the journalled messages file asynchronously.
 *
 * @returns {Promise<Array<preparedMessage>>} A Promise that resolves to an array of prepared messages from the send queue.
 */
async function readSendQueueAsync(): Promise<Array<preparedMessage>> {
  const journalPath: string = await initialiseJounaledMessagesFileAsync();
  const contents: string = await RNFS.readFile(journalPath, ENCODING);
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
/**
 * Tries to send a message, adding it to the queue if sending fails,
 * and ensures synchronization with the connection file system to avoid race conditions.
 *
 * @param {preparedMessage} message - The prepared message object to send.
 * @returns {Promise<void>} A Promise that resolves once the message is sent or added to the queue.
 */
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
/**
 * Empties the send queue by attempting to send queued messages and clearing the queue afterward,
 * If network fails, unsent message remain in the queue to be sent at a later time.
 * ensures synchronization with the connection file system to avoid race conditions.
 *
 * @returns {Promise<void>} A Promise that resolves if the queue is emptied or requeued.
 */
export async function sendMessageBacklog(): Promise<void> {
  const synced = async () => {
    const queuedMessages = await readSendQueueAsync();
    await overwriteSendQueueAsync([]);
    while (queuedMessages.length > 0) {
      console.log('queued message length: ', queuedMessages.length);
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
