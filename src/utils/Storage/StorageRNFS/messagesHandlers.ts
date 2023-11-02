import RNFS from 'react-native-fs';
import {conversationsDir, messagesDir} from '../../../configs/paths';
import {SavedMessageParams, SendStatus} from '../../Messaging/interfaces';
import {connectionFsSync} from '../../Synchronization';

const DEFAULT_ENCODING = 'utf8';

/**
 * Creates a conversations directory if it doesn't exist and returns the path to it.
 * @returns {Promise<string>} The path to the conversations directory.
 */
export async function makeConversationsDirAsync(): Promise<string> {
  const conversationsDirPath =
    RNFS.DocumentDirectoryPath + `${conversationsDir}`;
  const folderExists = await RNFS.exists(conversationsDirPath);
  if (folderExists) {
    return conversationsDirPath;
  } else {
    await RNFS.mkdir(conversationsDirPath);
    return conversationsDirPath;
  }
}

/**
 * Creates a chatId directory if it doesn't exist and returns the path to it.
 * @returns {Promise<string>} The path to the chatId directory.
 */
export async function initialiseChatIdDirAsync(
  chatId: string,
): Promise<string> {
  const conversationsDirPath = await makeConversationsDirAsync();
  const path = conversationsDirPath + '/' + chatId;
  const folderExists = await RNFS.exists(path);
  if (folderExists) {
    return path;
  } else {
    await RNFS.mkdir(path);
    return path;
  }
}

/**
 * Creates a messages directory if it doesn't exist and returns the path to it.
 * @returns {Promise<string>} The path to the messages directory.
 */
async function initialiseMessagesDirAsync(chatId: string): Promise<string> {
  const lineIdDirPath = await initialiseChatIdDirAsync(chatId);
  const path = lineIdDirPath + messagesDir;
  const folderExists = await RNFS.exists(path);
  if (folderExists) {
    return path;
  } else {
    await RNFS.mkdir(path);
    return path;
  }
}

/**
 * Creates an empty messages file if it doesn't exist and returns the path to it.
 * @returns {Promise<string>} The path to the messages file for the chat.
 * @todo support multiple messages files for the same chat
 */
async function initialiseMessagesFileAsync(chatId: string) {
  const messagesPath = (await initialiseMessagesDirAsync(chatId)) + '/1.txt';
  if (await RNFS.exists(messagesPath)) {
    return messagesPath;
  }
  await RNFS.writeFile(messagesPath, '', DEFAULT_ENCODING);
  return messagesPath;
}

/**
 * Saves a message to file. synced to solve for race conditions.
 * @param {string} chatId - chatId of the chat
 * @param {SavedMessageParams} message - message to save
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveMessageRNFS(
  chatId: string,
  message: SavedMessageParams,
  blocking: boolean = false,
) {
  const synced = async () => {
    const messagesPath = await initialiseMessagesFileAsync(chatId);
    await RNFS.appendFile(
      messagesPath,
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

export async function rewriteMessagesRNFS(
  chatId: string,
  messages: SavedMessageParams[],
  blocking: boolean = false,
) {
  const synced = async () => {
    const messagesPath = await initialiseMessagesFileAsync(chatId);
    await RNFS.writeFile(messagesPath, '', DEFAULT_ENCODING);
    for (let index = 0; index < messages.length; index++) {
      await RNFS.appendFile(
        messagesPath,
        JSON.stringify(messages[index]) + '\n',
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
 * Reads messages of a particular chat and returns the messages
 * @param {string} chatId - chatId of the chat
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @returns {Promise<Array<SavedMessageParams>>} An array containing the messages of a chat
 */
export async function readMessagesRNFS(
  chatId: string,
  blocking: boolean = false,
): Promise<Array<SavedMessageParams>> {
  if (blocking) {
    const synced = async () => {
      const messagesPath = await initialiseMessagesFileAsync(chatId);
      const contents = await RNFS.readFile(messagesPath, DEFAULT_ENCODING);
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
    return await connectionFsSync(synced);
  } else {
    const messagesPath = await initialiseMessagesFileAsync(chatId);
    const contents = await RNFS.readFile(messagesPath, DEFAULT_ENCODING);
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
}

export async function updateMessageSendStatusRNFS(
  chatId: string,
  messageId: string, //with sender prefix
  updatedStatus: SendStatus,
  blocking: boolean = false,
) {
  const synced = async () => {
    let messages = await readMessagesRNFS(chatId, false);
    const index: number = messages.findIndex(
      obj => obj.messageId === messageId,
    );
    if (index !== -1) {
      messages[index] = {...messages[index], sendStatus: updatedStatus};
    }
    await rewriteMessagesRNFS(chatId, messages, false);
  };
  if (blocking) {
    await connectionFsSync(synced);
  } else {
    await synced();
  }
}

export async function updateMessageRNFS(
  chatId: string,
  messageId: string, //with sender prefix
  update: SavedMessageParams,
  blocking: boolean = false,
) {
  const synced = async () => {
    let messages = await readMessagesRNFS(chatId, false);
    const index: number = messages.findIndex(
      obj => obj.messageId === messageId,
    );
    if (index !== -1) {
      messages[index] = {...update};
    }
    await rewriteMessagesRNFS(chatId, messages, false);
  };
  if (blocking) {
    await connectionFsSync(synced);
  } else {
    await synced();
  }
}
