import RNFS from 'react-native-fs';
import {makeConversationsDirAsync} from './messagesHandlers';
import {messageJournalDir, messageJournalPath} from '../../../configs/paths';
import {JournaledMessageParams} from '../../Messaging/interfaces';
import {connectionFsSync} from '../../Synchronization';

const DEFAULT_ENCODING = 'utf8';
/**
 * Creates a journal directory if it doesn't exist and returns the path to it.
 * @returns {Promise<string>} The path to the journal directory.
 */
export async function makeJournalDirAsync(): Promise<string> {
  const conversationsDirPath = await makeConversationsDirAsync();
  const path = conversationsDirPath + messageJournalDir;
  const folderExists = await RNFS.exists(path);
  if (folderExists) {
    return path;
  } else {
    await RNFS.mkdir(path);
    return path;
  }
}

/**
 * Initializes the journalled messages file asynchronously.
 * This function prepares the journalled messages file, creating an empty file it if it doesn't exist,
 * and returns the path to the file.
 * @returns {Promise<string>} A Promise that resolves to the path of the journalled messages file.
 */
export async function initialiseJounaledMessagesFileAsync(): Promise<string> {
  const journalPath: string =
    (await makeJournalDirAsync()) + `${messageJournalPath}`;
  if (await RNFS.exists(journalPath)) {
    return journalPath;
  }
  await RNFS.writeFile(journalPath, '', DEFAULT_ENCODING);
  return journalPath;
}

/**
 * Adds a message to the journal file.
 * @param {JournaledMessageParams} message - The message object to add to the journal file.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false
 * @returns {Promise<void>} A Promise that resolves once the message is added to the journal file.
 */
export async function addToJournalRNFS(
  message: JournaledMessageParams,
  blocking: boolean = false,
): Promise<void> {
  const synced = async () => {
    const journalPath: string = await initialiseJounaledMessagesFileAsync();
    await RNFS.appendFile(
      journalPath,
      JSON.stringify(message) + '\n',
      DEFAULT_ENCODING,
    );
  };
  if (blocking) {
    await connectionFsSync(synced);
  } else {
    await synced();
  }
}

/**
 * Overwrites the journal file with a new set of prepared messages.
 * @param {Array<JournaledMessageParams>} queue - The array of messages to overwrite the journal file with.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false
 * @returns {Promise<void>} A Promise that resolves once the journal file is overwritten.
 */
export async function overwriteJournalRNFS(
  queue: Array<JournaledMessageParams>,
  blocking: boolean = false,
): Promise<void> {
  const synced = async () => {
    const journalPath: string = await initialiseJounaledMessagesFileAsync();
    await RNFS.writeFile(journalPath, '', DEFAULT_ENCODING);
    for (let index = 0; index < queue.length; index++) {
      await RNFS.appendFile(
        journalPath,
        JSON.stringify(queue[index]) + '\n',
        DEFAULT_ENCODING,
      );
    }
  };
  if (blocking) {
    await connectionFsSync(synced);
  } else {
    await synced();
  }
}

/**
 * Reads the messages from the journalled messages file.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false
 * @returns {Promise<Array<JournaledMessageParams>>} A Promise that resolves to an array of messages from the journal file.
 */
export async function readJournalRNFS(
  blocking: boolean = false,
): Promise<Array<JournaledMessageParams>> {
  const synced = async () => {
    const journalPath: string = await initialiseJounaledMessagesFileAsync();
    const contents: string = await RNFS.readFile(journalPath, DEFAULT_ENCODING);
    const messagesArray = contents.split('\n');
    if (messagesArray.length <= 1) {
      return [];
    } else {
      const parsedArray = messagesArray
        .slice(0, -1)
        .map(element => JSON.parse(element));
      return parsedArray;
    }
  };
  if (blocking) {
    return await connectionFsSync(synced);
  } else {
    return await synced();
  }
}
