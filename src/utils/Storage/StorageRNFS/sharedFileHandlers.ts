import RNFS from 'react-native-fs';
import {conversationsDir, filesDir, mediaDir, tempDir} from '@configs/paths';
import {generateRandomHexId} from '@utils/IdGenerator';
import {ContentType} from '@utils/Messaging/interfaces';
import {
  SHARED_FILE_SIZE_LIMIT_IN_BYTES,
  FILE_COMPRESSION_THRESHOLD,
} from '@configs/constants';
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

/**
 *
 * @param chatId
 * @param fileUri
 * @param fileName
 * @param contentType
 * @param deleteOriginal should fileUri be removed
 * @returns
 */
export async function moveToLargeFileDir(
  chatId: string,
  fileUri: string,
  fileName: string | null,
  contentType: ContentType = ContentType.image,
  deleteOriginal: boolean = true,
): Promise<string> {
  if (contentType === ContentType.displayImage) {
    return fileUri;
  }
  const newFileName = fileName ? fileName : getFileNameFromUri(fileUri);
  if (
    contentType === ContentType.image ||
    contentType === ContentType.video ||
    contentType === ContentType.audioRecording
  ) {
    return getRelativeURI(
      await moveToMediaDir(chatId, fileUri, newFileName, deleteOriginal),
      'doc',
    );
  } else {
    return getRelativeURI(
      await moveToFilesDir(chatId, fileUri, newFileName, deleteOriginal),
      'doc',
    );
  }
}

/**
 * Checks if an uri is an avatar uri.
 * @param uri
 * @returns
 */
export const isAvatarUri = (uri: string) => {
  const isAvatar = uri.substring(0, 9) === 'avatar://';
  return isAvatar;
};

/**
 * Checks if an uri is a media uri.
 * @param uri
 * @returns
 */
export const isMediaUri = (uri: string) => {
  const isMedia = uri.substring(0, 8) === 'media://';
  return isMedia;
};

/**
 * Creates a copy of the large file in the files directory of a chat.
 * @returns {Promise<string>} A Promise that resolves to the destination path.
 */
async function moveToFilesDir(
  chatId: string,
  fileUri: string,
  fileName: string,
  deleteOriginal: boolean = true,
): Promise<string> {
  const chatIdDir = await initialiseLargeFileDirAsync(chatId);
  const destinationPath =
    chatIdDir + filesDir + '/' + generateRandomHexId() + '_' + fileName;
  const moveOrCopy = deleteOriginal ? RNFS.moveFile : RNFS.copyFile;
  try {
    await moveOrCopy(decodeURIComponent(fileUri), destinationPath);
    console.log('Destination: ', destinationPath);
  } catch (error) {
    console.log('Error moving file: ', error);
  }
  return destinationPath;
}

/**
 * Moves the large file in the media directory of a chat.
 * @returns {Promise<string>} A Promise that resolves to the destination path.
 */
async function moveToMediaDir(
  chatId: string,
  fileUri: string,
  fileName: string,
  deleteOriginal: boolean = true,
): Promise<string> {
  const chatIdDir = await initialiseLargeFileDirAsync(chatId);
  const destinationPath =
    chatIdDir + mediaDir + '/' + generateRandomHexId() + '_' + fileName;
  const moveOrCopy = deleteOriginal ? RNFS.moveFile : RNFS.copyFile;
  try {
    await moveOrCopy(decodeURIComponent(fileUri), destinationPath);
    console.log('Destination: ', destinationPath);
  } catch (error) {
    console.log('Error moving file: ', error);
  }
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

export async function checkFileSizeWithinLimits(
  fileUri: string,
  location: 'doc' | 'tmp' | 'cache' = 'doc',
) {
  try {
    const absoluteURI = getSafeAbsoluteURI(fileUri, location);
    const fileSize = (await RNFS.stat(absoluteURI)).size;
    console.log('File size: ', fileSize);
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
  const filePath = getSafeAbsoluteURI(tempFilePath, 'doc');
  try {
    await RNFS.unlink(filePath);
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

export async function downloadImageToMediaDir(
  chatId: string,
  fileName: string,
  fromUrl: string | null,
): Promise<string | null> {
  if (fromUrl) {
    const chatIdDir = await initialiseLargeFileDirAsync(chatId);
    const destinationPath =
      chatIdDir + mediaDir + '/' + generateRandomHexId() + '_' + fileName;
    //download image to destination
    return await downloadImage(fromUrl, destinationPath);
  }
  return null;
}

async function downloadImage(
  fromUrl: string,
  toLocation: string,
): Promise<string | null> {
  await RNFS.writeFile(toLocation, '');
  try {
    const downloadOptions = {
      fromUrl: fromUrl,
      toFile: toLocation,
    };
    const response = await RNFS.downloadFile(downloadOptions).promise;
    if (response.statusCode === 200) {
      console.log('resource downloaded successfully');
      return getRelativeURI(toLocation, 'doc');
    }
    console.log('response code: ', response.statusCode);
    throw new Error('ResponseError');
  } catch (error) {
    console.log('error downloading resource: ', error);
    await deleteFile(toLocation);
    return null;
  }
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
  _location: 'doc' | 'cache' | 'tmp' = 'doc',
): string {
  if (!fileURI || isAvatarUri(fileURI) || isMediaUri(fileURI)) {
    return fileURI;
  }
  if (
    fileURI &&
    (fileURI.includes(RNFS.CachesDirectoryPath) ||
      fileURI.includes(RNFS.TemporaryDirectoryPath) ||
      fileURI.includes(RNFS.DocumentDirectoryPath))
  ) {
    return addFilePrefix(fileURI);
  } else {
    return addFilePrefix(RNFS.DocumentDirectoryPath + '/' + fileURI);
  }
}

/**
 * Returns a safe relative URI for items stored in document storage
 * that can accessed anywhere irrespective of file system changes unless the underlying storage is cleared.
 * If item is not in document storage, returns unchanged uri.
 * @param fileURI
 * @param location - deprecated - storage location (can be documents, files and cache)
 * @returns {string} relative file URI or file URI depending on whether the file is in document storage.
 */
export function getRelativeURI(
  fileURI: string,
  _location: 'doc' | 'cache' | 'tmp' = 'doc',
): string {
  if (fileURI.includes(RNFS.DocumentDirectoryPath)) {
    return removeFilePrefix(fileURI.replace(RNFS.DocumentDirectoryPath, ''));
  } else {
    return fileURI;
  }
}

//tmp directory name repeats are not handled in ios. thus, we need to handle it.
async function checkRepeteInTmp(fileUri: string, source?: string) {
  //if source is already in temp directorym don't do anything.
  if (source) {
    if (source.includes(RNFS.TemporaryDirectoryPath)) {
      return;
    }
  }
  // check if repeat exists and delete if exists
  const doesExist = await RNFS.exists(fileUri);
  if (doesExist) {
    await RNFS.unlink(fileUri);
  }
}

/**
 * Moves a source file to the tmp directory.
 * @param source - source file absolute path
 * @param fileName - file name
 * @returns - absolute file path with file:// prefix added.
 */
export async function moveToTmp(source: string, fileName?: string) {
  try {
    //edge case on ios where temp director has a / at the end.
    const separator = isIOS ? '' : '/';
    const newFileName = fileName
      ? fileName.replace(/\//g, '')
      : getFileNameFromUri(source);
    const newPath = RNFS.TemporaryDirectoryPath + separator + newFileName;
    await checkRepeteInTmp(newPath, decodeURIComponent(source));
    await RNFS.moveFile(decodeURIComponent(source), newPath);
    return addFilePrefix(newPath);
  } catch (error) {
    console.log('Unable to move to tmp dir', error);
    return null;
  }
}

export function getFileNameFromUri(uri: string): string {
  try {
    const pathname = uri;
    const fileName = pathname.substring(pathname.lastIndexOf('/') + 1);
    return fileName;
  } catch (error) {
    console.error('Invalid URI:', error);
    return generateRandomHexId();
  }
}

export async function copyToTmp(
  fileUri: string | null | undefined,
  fileName: string = 'unknown.unknown',
) {
  try {
    if (!fileUri) {
      throw new Error('No file Uri');
    }
    //edge case on ios where temp director has a / at the end.
    const separator = isIOS ? '' : '/';
    const source = getSafeAbsoluteURI(decodeURIComponent(fileUri), 'doc');
    const newPath =
      RNFS.TemporaryDirectoryPath + separator + fileName.replace(/\//g, '');
    await checkRepeteInTmp(newPath);
    await RNFS.copyFile(source, newPath);
    return addFilePrefix(newPath);
  } catch (error) {
    console.log('Unable to copy to tmp dir', error);
    return null;
  }
}

/**
 * Checks if a file is over the compression threshold to trigger compression
 * @param filePath - absolute file path of the media being considered for compression
 * @returns - whether compression is required.
 */
export async function shouldCompress(filePath: string) {
  const fileStat = await RNFS.stat(filePath);
  if (fileStat.size > FILE_COMPRESSION_THRESHOLD) {
    return true;
  } else {
    return false;
  }
}
