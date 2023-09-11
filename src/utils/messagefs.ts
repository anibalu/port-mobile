import RNFS from 'react-native-fs';
import {messagesDir} from '../configs/paths';
import {directMessageContent} from './MessageInterface';
import {connectionFsSync} from './syncronization';

const path = RNFS.DocumentDirectoryPath + '/' + messagesDir;
const ENCODING = 'utf8';

//initialise folder
export async function initialiseMessagesDirAsync() {
  const folderExists = await RNFS.exists(path);
  if (folderExists) {
    return;
  } else {
    await RNFS.mkdir(path);
  }
}

//initialise messages file
//eventually multiple message files will exist per direct chat
async function initialiseDirectMessagesFileAsync(lineId: string) {
  const messagesPath = path + '/' + '00001_' + lineId + '.msgs';
  await initialiseMessagesDirAsync();
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
