import RNFS from 'react-native-fs';
import {
  conversationsDir,
  filesDir,
  mediaDir,
  tempDir,
} from '../../../configs/paths';
import {generateRandomHexId} from '@utils/IdGenerator';
import {ContentType} from '@utils/Messaging/interfaces';
import {SHARED_FILE_SIZE_LIMIT_IN_BYTES} from '@configs/constants';
import {decryptFile} from '@utils/Crypto/aesFile';
import {isIOS} from '@components/ComponentUtils';

/**
 * Creates a conversations directory if it doesn't exist and returns the path to it.
 * @returns {Promise<string>} The path to the conversations directory.
 */
async function makeConversationsDirAsync(): Promise<string> {
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
async function initialiseChatIdDirAsync(chatId: string): Promise<string> {
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
 * Initializes the directories to store large files.
 * @returns {Promise<string>} A Promise that resolves to the path to the chatId directory.
 */
async function initialiseLargeFileDirAsync(chatId: string): Promise<string> {
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
): Promise<string> {
  if (contentType === ContentType.displayImage) {
    return fileUri;
  }
  if (contentType === ContentType.image || contentType === ContentType.video) {
    return getRelativeURI(
      await moveToMediaDir(chatId, fileUri, fileName),
      'doc',
    );
  } else {
    return getRelativeURI(
      await moveToFilesDir(chatId, fileUri, fileName),
      'doc',
    );
  }
}

/**
 * Creates a copy of the large file in the files directory of a chat.
 * @returns {Promise<string>} A Promise that resolves to the destination path.
 */
async function moveToFilesDir(
  chatId: string,
  fileUri: string,
  fileName: string,
): Promise<string> {
  const chatIdDir = await initialiseLargeFileDirAsync(chatId);
  const destinationPath =
    chatIdDir + filesDir + '/' + generateRandomHexId() + '_' + fileName;
  await RNFS.moveFile(fileUri, destinationPath);
  console.log('Destination: ', destinationPath);
  return destinationPath;
}

/**
 * Creates a copy of the large file in the media directory of a chat.
 * @returns {Promise<string>} A Promise that resolves to the destination path.
 */
async function moveToMediaDir(
  chatId: string,
  fileUri: string,
  fileName: string,
): Promise<string> {
  const chatIdDir = await initialiseLargeFileDirAsync(chatId);
  const destinationPath =
    chatIdDir + mediaDir + '/' + generateRandomHexId() + '_' + fileName;
  await RNFS.moveFile(fileUri, destinationPath);
  return destinationPath;
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

export async function checkFileSizeWithinLimits(fileUri: string) {
  try {
    const absoluteURI = getSafeAbsoluteURI(fileUri, 'doc');
    console.log('Absolute: ', absoluteURI);
    const fileSize = (await RNFS.stat(absoluteURI)).size;
    if (fileSize && fileSize < SHARED_FILE_SIZE_LIMIT_IN_BYTES) {
      return true;
    }
    return false;
  } catch (error) {
    console.log('Error checking if file size within limits: ', error);
    return false;
  }
}

export async function initialiseEncryptedTempFile(
  fileName: string = '',
): Promise<string> {
  const tempDirPath = await initialiseTempDirAsync();
  const tempName = fileName + '_' + generateRandomHexId() + '.enc';
  const tempFilePath = tempDirPath + '/' + tempName;
  await RNFS.writeFile(tempFilePath, '');
  return tempFilePath;
}

export async function deleteFile(tempFilePath: string) {
  try {
    await RNFS.unlink(tempFilePath);
  } catch (error) {
    console.log('Error deleting file: ', error);
  }
}

export async function decryptToLargeFileDir(
  chatId: string,
  contentType: ContentType,
  encryptedFilePath: string,
  key: string,
  fileName: string,
): Promise<string> {
  if (
    contentType === ContentType.image ||
    contentType === ContentType.video ||
    contentType === ContentType.displayImage
  ) {
    return await decryptToMediaDir(chatId, encryptedFilePath, key, fileName);
  } else {
    return await decryptToFilesDir(chatId, encryptedFilePath, key, fileName);
  }
}

async function decryptToMediaDir(
  chatId: string,
  encryptedFilePath: string,
  key: string,
  fileName: string,
): Promise<string> {
  const chatIdDir = await initialiseLargeFileDirAsync(chatId);
  const destinationPath =
    chatIdDir + mediaDir + '/' + generateRandomHexId() + '_' + fileName;
  await decryptFile(encryptedFilePath, destinationPath, key);
  return addFilePrefix(destinationPath);
}

async function decryptToFilesDir(
  chatId: string,
  encryptedFilePath: string,
  key: string,
  fileName: string,
): Promise<string> {
  const chatIdDir = await initialiseLargeFileDirAsync(chatId);
  const destinationPath =
    chatIdDir + filesDir + '/' + generateRandomHexId() + '_' + fileName;
  await decryptFile(encryptedFilePath, destinationPath, key);
  return addFilePrefix(destinationPath);
}

export async function downloadResource(fromUrl: string) {
  const encryptedFilePath = await initialiseEncryptedTempFile();
  try {
    const downloadOptions = {
      fromUrl: fromUrl,
      toFile: encryptedFilePath,
    };
    const response = await RNFS.downloadFile(downloadOptions).promise;
    if (response.statusCode === 200) {
      console.log('file downloaded successfully');
      return encryptedFilePath;
    }
    console.log('response code: ', response.statusCode);
    throw new Error('ResponseError');
  } catch (error) {
    console.log('error downloading resource: ', error);
    await deleteFile(encryptedFilePath);
    throw new Error('DownloadError');
  }
}

export function addFilePrefix(fileUri: string) {
  if (fileUri.substring(0, 7) === 'file://') {
    return fileUri;
  } else {
    return 'file://' + fileUri;
  }
}

export function removeFilePrefix(fileUri: string) {
  if (fileUri.substring(0, 7) === 'file://') {
    return fileUri.substring(7);
  } else {
    return fileUri;
  }
}

/**
 * Returns a safely accessible URI that can be used for any media operation in the app.
 * @param fileURI
 * @param location storage location (can be documents or cache)
 * @returns {string} absolute file path that can be accessed.
 */
export function getSafeAbsoluteURI(
  fileURI: string,
  location: 'doc' | 'cache',
): string {
  switch (location) {
    case 'doc':
      if (
        fileURI.includes('Documents/') ||
        fileURI.includes('com.numberless/')
      ) {
        console.log(
          'Entered an absolute file path when a relative one was required',
        );
        return addFilePrefix(fileURI);
      } else {
        return addFilePrefix(RNFS.DocumentDirectoryPath + '/' + fileURI);
      }
    case 'cache':
      if (fileURI.includes('Caches/') || fileURI.includes('com.numberless/')) {
        console.warn(
          'Entered an absolute cache path when a relative one was required',
        );
        return addFilePrefix(fileURI);
      } else {
        return addFilePrefix(RNFS.CachesDirectoryPath + '/' + fileURI);
      }
  }
}

/**
 * Returns a safe relative URI that can accessed anywhere irrespective of file system changes unless the underlying storage is cleared
 * @param fileURI
 * @param location storage location (can be documents, files and cache)
 * @returns {string} relative file URI
 */
export function getRelativeURI(
  fileURI: string,
  location: 'doc' | 'cache',
): string {
  switch (location) {
    case 'doc':
      if (isIOS) {
        const documentsIndex = fileURI.indexOf('Documents/');
        return fileURI.substring(documentsIndex + 'Documents/'.length);
      } else {
        const documentsIndex = fileURI.indexOf('files/');
        return fileURI.substring(documentsIndex + 'files/'.length);
      }
    case 'cache':
      if (isIOS) {
        const cachesIndex = fileURI.indexOf('Caches/');
        return fileURI.substring(cachesIndex + 'Caches/'.length);
      } else {
        const cachesIndex = fileURI.indexOf('cache/');
        return fileURI.substring(cachesIndex + 'cache/'.length);
      }
  }
}
