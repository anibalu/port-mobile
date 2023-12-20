import RNFS from 'react-native-fs';
import {initialiseChatIdDirAsync} from './messagesHandlers';
import {filesDir, mediaDir, tempDir} from '../../../configs/paths';
import {generateRandomHexId} from '@utils/Messaging/idGenerator';
import {ContentType} from '@utils/Messaging/interfaces';

const DEFAULT_ENCODING = 'base64';
const WRITE_ENCODING = 'utf8';
/**
 * Initializes the directories to store large files.
 * @returns {Promise<string>} A Promise that resolves to the path to the chatId directory.
 */
async function initialiseLargeFileDirAsync(chatId: string) {
  const chatIdDir = await initialiseChatIdDirAsync(chatId);
  const folderExists = await RNFS.exists(chatIdDir);
  if (!folderExists) {
    await RNFS.mkdir(chatIdDir);
  }
  const mediaFilesDir = chatIdDir + mediaDir;
  const mediaDirExists = await RNFS.exists(mediaFilesDir);
  if (!mediaDirExists) {
    await RNFS.mkdir(mediaFilesDir);
  }
  const fileDir = chatIdDir + filesDir;
  const fileDirExists = await RNFS.exists(fileDir);
  if (!fileDirExists) {
    await RNFS.mkdir(fileDir);
  }
  return chatIdDir;
}

export async function moveToLargeFileDir(
  chatId: string,
  fileUri: string,
  fileName: string,
  contentType: ContentType,
) {
  if (contentType === ContentType.displayImage) {
    return fileUri;
  }
  if (contentType === ContentType.image || contentType === ContentType.video) {
    return await moveToMediaDir(chatId, fileUri, fileName);
  } else {
    return await moveToFilesDir(chatId, fileUri, fileName);
  }
}

/**
 * Creates a copy of the large file in the files directory of a chat.
 * @returns {Promise<string>} A Promise that resolves to the destination path.
 */
export async function moveToFilesDir(
  chatId: string,
  fileUri: string,
  fileName: string,
) {
  const chatIdDir = await initialiseLargeFileDirAsync(chatId);
  const destinationPath =
    chatIdDir + filesDir + '/' + generateRandomHexId() + '_' + fileName;
  await RNFS.moveFile(fileUri, destinationPath);
  return destinationPath;
}

/**
 * Creates a copy of the large file in the media directory of a chat.
 * @returns {Promise<string>} A Promise that resolves to the destination path.
 */
export async function moveToMediaDir(
  chatId: string,
  fileUri: string,
  fileName: string,
) {
  const chatIdDir = await initialiseLargeFileDirAsync(chatId);
  const destinationPath =
    chatIdDir + mediaDir + '/' + generateRandomHexId() + '_' + fileName;
  await RNFS.moveFile(fileUri, destinationPath);
  return destinationPath;
}

/**
 * Saves the large file in the files directory of a chat.
 * @returns {Promise<string>} A Promise that resolves to the destination path.
 */
export async function saveToFilesDir(
  chatId: string,
  plaintext: string,
  fileName: string,
  encoding: string = DEFAULT_ENCODING,
) {
  const chatIdDir = await initialiseLargeFileDirAsync(chatId);
  const destinationPath =
    chatIdDir + filesDir + '/' + generateRandomHexId() + '_' + fileName;
  await RNFS.writeFile(destinationPath, plaintext, encoding);
  return destinationPath;
}

/**
 * Saves the large file in the media directory of a chat.
 * @returns {Promise<string>} A Promise that resolves to the destination path.
 */
export async function saveToMediaDir(
  chatId: string,
  plaintext: string,
  fileName: string,
  encoding: string = DEFAULT_ENCODING,
) {
  const chatIdDir = await initialiseLargeFileDirAsync(chatId);
  const destinationPath =
    chatIdDir + mediaDir + '/' + generateRandomHexId() + '_' + fileName;
  await RNFS.writeFile(destinationPath, plaintext, encoding);
  return destinationPath;
}

/**
 * Read a binary file and output its contents as a base64 encoded string.
 * @param {string} fileUri - Uri of the binary file to read
 * @returns {Promise<string>} A Promise that resolves to the base64 encoded string.
 */
export async function readFileBase64(fileUri: string) {
  return await RNFS.readFile(fileUri, 'base64');
}

async function initialiseTempDirAsync() {
  const tempDirPath = RNFS.DocumentDirectoryPath + `${tempDir}`;
  const folderExists = await RNFS.exists(tempDirPath);
  if (folderExists) {
    return tempDirPath;
  } else {
    await RNFS.mkdir(tempDirPath);
    return tempDirPath;
  }
}

export async function createTempFileUpload(data: string) {
  const tempDirPath = await initialiseTempDirAsync();
  const tempName = getTempFileId() + '.txt';
  const tempFilePath = tempDirPath + '/' + tempName;
  await RNFS.writeFile(tempFilePath, data, WRITE_ENCODING);
  return {path: tempFilePath, name: tempName};
}

export async function deleteTempFileUpload(tempFilePath: string) {
  await RNFS.unlink(tempFilePath);
}

async function getTempFileId() {
  const date = new Date();
  return date.getTime().toString();
}

//use this function to fetch media files of a particular chat
export async function fetchFilesInMediaDir(chatId: string) {
  const chatIdDir = await initialiseLargeFileDirAsync(chatId);
  const pathToMediaDir = chatIdDir + mediaDir;
  const files = await RNFS.readDir(pathToMediaDir);
  return files;
}
export async function fetchFilesInFileDir(chatId: string) {
  const chatIdDir = await initialiseLargeFileDirAsync(chatId);
  const pathToFileDir = chatIdDir + filesDir;
  const files = await RNFS.readDir(pathToFileDir);
  return files;
}
