import RNFS from 'react-native-fs';
import {conversationsDir, messagesDir} from '../configs/paths';
import {directMessageContent} from './MessageInterface';
import {connectionFsSync} from './syncronization';

const ENCODING = 'utf8';

/**
 * Creates a conversations directory if it doesn't exist and returns the path to it.
 * @returns {Promise<string>} The path to the conversations directory.
 */
export async function makeConversationsDir(): Promise<string> {
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
 * Creates a lineId directory if it doesn't exist and returns the path to it.
 * @returns {Promise<string>} The path to the lineId directory.
 */
export async function initialiseLineIdDirAsync(
  lineId: string,
): Promise<string> {
  const conversationsDirPath = await makeConversationsDir();
  const path = conversationsDirPath + '/' + lineId;
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
export async function initialiseMessagesDirAsync(
  lineId: string,
): Promise<string> {
  const lineIdDirPath = await initialiseLineIdDirAsync(lineId);
  const path = lineIdDirPath + messagesDir;
  const folderExists = await RNFS.exists(path);
  if (folderExists) {
    return path;
  } else {
    await RNFS.mkdir(path);
    return path;
  }
}

//initialise messages file
//eventually multiple message files will exist per direct chat
async function initialiseDirectMessagesFileAsync(lineId: string) {
  const messagesPath = (await initialiseMessagesDirAsync(lineId)) + '/1.txt';
  console.log('messages path: ', messagesPath);
  if (await RNFS.exists(messagesPath)) {
    return messagesPath;
  }
  // write an empty list to the file
  await RNFS.writeFile(messagesPath, '', ENCODING);
  return messagesPath;
}

//save new message
export async function saveNewDirectMessage(
  lineId: string,
  message: directMessageContent,
) {
  const synced = async () => {
    const messagesPath = await initialiseDirectMessagesFileAsync(lineId);
    message.inFile = true;
    await RNFS.appendFile(messagesPath, JSON.stringify(message) + '\n');
  };
  await connectionFsSync(synced);
}

//read messages
export async function readDirectMessages(
  lineId: string,
): Promise<Array<directMessageContent>> {
  const synced = async () => {
    const messagesPath = await initialiseDirectMessagesFileAsync(lineId);
    const contents = await RNFS.readFile(messagesPath, ENCODING);
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
}

//successfully sent message 'sent' attribute is toggled to true.
// TO DO: after multifile support has been implemented.
export async function toggleSentDirectMessage(
  lineId: string,
  messageId: string,
) {
  return lineId + messageId;
}

//checks for a message with the corresponding message ID in the most recent message file.
// TO DO: after multifile support has been implemented.
export async function checkMessageReceived(lineId: string, messageId: string) {
  return lineId + messageId;
}
