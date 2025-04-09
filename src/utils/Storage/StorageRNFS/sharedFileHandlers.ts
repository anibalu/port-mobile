import RNFS from 'react-native-fs';

import {
  FILE_ENCRYPTION_KEY_LENGTH,
  SHARED_FILE_SIZE_LIMIT_IN_BYTES,
} from '@configs/constants';
import {conversationsDir, filesDir, mediaDir} from '@configs/paths';

import {generateRandomHexId} from '@utils/IdGenerator';
import {ContentType} from '@utils/Messaging/interfaces';

import NativeCryptoModule from 'src/specs/NativeCryptoModule';

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
 * Get the decoded file name given the full uri.
 * @param uri - file Uri
 * @returns - file name with extention or 32 character hex Id if an error is encountered.
 */
export function getFileNameFromUri(uri: string): string {
  try {
    const pathname = uri;
    const fileName = decodeURIComponent(
      pathname.substring(pathname.lastIndexOf('/') + 1),
    );
    return fileName;
  } catch (error) {
    console.error('Invalid URI:', error);
    return generateRandomHexId();
  }
}

/**
 * these content types cannot be moved
 */
const moveExemptContentTypes = [ContentType.displayImage];

/**
 * these content types will use the media dir
 */
const moveToMediaDirContentTypes = [ContentType.image, ContentType.video];

/**
 * these content types will use the files dir
 */
const moveToFilesDirContentTypes = [
  ContentType.file,
  ContentType.audioRecording,
];

/**
 * copies or moves file to media directory of a chat
 * @param chatId
 * @param fileUri
 * @param fileName - use null value if you want fileName to be extracted from file Uri.
 * @param contentType - certain content types go to files dir and certain go to regular media dir
 * @param deleteOriginal - whether we need to move or copy. default is move.
 * @returns - relative file Uri of new location in media dir
 */
export async function moveToLargeFileDir(
  chatId: string,
  fileUri: string,
  fileName: string | null,
  contentType: ContentType = ContentType.image,
  deleteOriginal: boolean = true,
): Promise<string> {
  if (moveExemptContentTypes.includes(contentType)) {
    return fileUri;
  }
  const newFileName = fileName ? fileName : getFileNameFromUri(fileUri);
  if (moveToMediaDirContentTypes.includes(contentType)) {
    return getRelativeURI(
      await moveToMediaDir(chatId, fileUri, newFileName, deleteOriginal),
    );
  }
  if (moveToFilesDirContentTypes.includes(contentType)) {
    return getRelativeURI(
      await moveToFilesDir(chatId, fileUri, newFileName, deleteOriginal),
    );
  }
  //by default, new content types that are not exempt will use files Dir.
  return getRelativeURI(
    await moveToFilesDir(chatId, fileUri, newFileName, deleteOriginal),
  );
}

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
    await moveOrCopy(fileUri, destinationPath);
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
    await moveOrCopy(fileUri, destinationPath);
    console.log('Destination: ', destinationPath);
  } catch (error) {
    console.log('Error moving file: ', error);
  }
  return destinationPath;
}

/**
 * Checks if file size is lower than shared file size limit.
 * @param fileUri
 * @returns - True if file size is within limits.
 */
export async function checkFileSizeWithinLimits(fileUri: string) {
  try {
    const absoluteURI = getSafeAbsoluteURI(fileUri);
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

/**
 * Initialises an empty file in the tmp directory.
 * @param fileName - optional file name prefix
 * @returns
 */
export async function initialiseEncryptedTempFile(): Promise<string> {
  const tempDirPath = RNFS.TemporaryDirectoryPath;
  const tempName = generateRandomHexId() + '.enc';
  const tempFilePath = tempDirPath + '/' + tempName;
  await RNFS.writeFile(tempFilePath, '');
  return tempFilePath;
}

export interface EncryptedFileProperties {
  key: string;
  encryptedFilePath: string;
}

/**
 * Encrypt a file using AES scheme.
 * @param inputFilePath - file being encrypted.
 * @returns
 */
export async function encryptFile(
  inputFilePath: string,
): Promise<EncryptedFileProperties> {
  const encryptedFilePath = await initialiseEncryptedTempFile();
  try {
    const key = await NativeCryptoModule.aes256FileEncrypt(
      removeFilePrefix(inputFilePath),
      encryptedFilePath,
    );
    if (key.length !== FILE_ENCRYPTION_KEY_LENGTH) {
      throw new Error(key);
    }
    return {key: key, encryptedFilePath: encryptedFilePath};
  } catch (error) {
    console.log('Error encrypting file: ', error);
    await deleteFile(encryptedFilePath);
    throw new Error('FileEncryptionError');
  }
}

/**
 * Decrypt a file encrypted using AES scheme.
 * @param encryptedFilePath
 * @param decryptedFilePath - location to decrypt the file to.
 * @param key
 */
export async function decryptFile(
  encryptedFilePath: string,
  decryptedFilePath: string,
  key: string,
) {
  try {
    await RNFS.writeFile(decryptedFilePath, '');
    console.log('initial file created');
    await NativeCryptoModule.aes256FileDecrypt(
      encryptedFilePath,
      decryptedFilePath,
      key,
    );
  } catch (error) {
    await RNFS.unlink(decryptedFilePath);
    console.log('Error decrypting file: ', error);
    throw new Error('Error decrypting file');
  }
}

/**
 * Deletes a file given its uri
 * @param fileUri - can be relative or absolute uri
 */
export async function deleteFile(fileUri: string) {
  const filePath = getSafeAbsoluteURI(fileUri);
  try {
    await RNFS.unlink(filePath);
  } catch (error) {
    console.log('Error deleting file: ', error);
  }
}

/**
 * these content types will be decrypted to the media dir
 */
const decryptToMediaDirContentTypes = [
  ContentType.image,
  ContentType.video,
  ContentType.displayImage,
];

/**
 * Decrypts an encrypted file to the right large file directory
 * @param chatId
 * @param contentType
 * @param encryptedFilePath - absolute uri of the encrypted file
 * @param key - key to decrypt the encrypted file
 * @param fileName - fileName of the decrypted file
 * @returns relative location of decrypted file
 */
export async function decryptToLargeFileDir(
  chatId: string,
  contentType: ContentType,
  encryptedFilePath: string,
  key: string,
  fileName: string,
): Promise<string> {
  if (decryptToMediaDirContentTypes.includes(contentType)) {
    return getRelativeURI(
      await decryptToMediaDir(chatId, encryptedFilePath, key, fileName),
    );
  } else {
    return getRelativeURI(
      await decryptToFilesDir(chatId, encryptedFilePath, key, fileName),
    );
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

/**
 * Downloads an image located at fromUrl to the chat's media dir.
 * @param chatId
 * @param fileName - fileName for downloaded file
 * @param fromUrl - uri from which to download image
 * @returns - null if download fails. relative fileUri if it succeeds.
 */
export async function downloadImageToMediaDir(
  chatId: string,
  fileName: string,
  fromUrl: string | null,
): Promise<string | null> {
  if (!fromUrl) {
    return null;
  }
  const chatIdDir = await initialiseLargeFileDirAsync(chatId);
  const destinationPath =
    chatIdDir + mediaDir + '/' + generateRandomHexId() + '_' + fileName;
  //create an empty destination file.
  await RNFS.writeFile(destinationPath, '');
  //download image to destination
  try {
    await downloadFile(fromUrl, destinationPath);
    return getRelativeURI(destinationPath);
  } catch {
    //if download fails, return null.
    return null;
  }
}

/**
 * Downloads a resource to the tmp directory
 * @param fromUrl - uri from which to download resource
 * @returns - fileUri of the downloaded file in the tmp dir
 */
export async function downloadResourceToTmpDir(
  fromUrl: string,
): Promise<string> {
  const encryptedFilePath = await initialiseEncryptedTempFile();
  await downloadFile(fromUrl, encryptedFilePath);
  return encryptedFilePath;
}

/**
 * Downloads a resource to the provided location.
 * @param fromUrl
 * @param toLocation
 * @throws error if there is an issue downloading.
 */
async function downloadFile(
  fromUrl: string,
  toLocation: string,
): Promise<void> {
  try {
    const downloadOptions = {
      fromUrl: fromUrl,
      toFile: toLocation,
    };
    const response = await RNFS.downloadFile(downloadOptions).promise;
    if (response.statusCode === 200) {
      console.log('resource downloaded successfully');
      return;
    }
    console.log('response code: ', response.statusCode);
    throw new Error('ResponseError');
  } catch (error) {
    console.log('error downloading resource: ', error);
    await deleteFile(toLocation);
    throw new Error('DownloadError');
  }
}

/**
 * Adds a 'file://' prefix to a file path if it already doesn't exist.
 * @param fileUri - file path
 * @returns - file path with 'file://' prefix added
 */
export function addFilePrefix(fileUri: string) {
  if (fileUri.substring(0, 7) === 'file://') {
    return fileUri;
  } else {
    return 'file://' + fileUri;
  }
}

/**
 * removes the 'file://' prefix if it exists.
 * @param fileUri - file path
 * @returns - file path with 'file://' prefix removed
 */
export function removeFilePrefix(fileUri: string) {
  if (fileUri.substring(0, 7) === 'file://') {
    return fileUri.substring(7);
  } else {
    return fileUri;
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
export const isMediaUri = (uri?: string | null) => {
  if (uri) {
    const isMedia = uri.substring(0, 8) === 'media://';
    return isMedia;
  }
  return false;
};

/**
 * Returns a safely accessible URI that can be used for any media operation in the app.
 * @param fileURI - relative or absolute uri
 * @returns {string} absolute file path with the appropriate type prefix added. (file:// or media:// or avatar:// etc.)
 */
export function getSafeAbsoluteURI(
  fileURI: string,
  _location?: string, //deprecated
): string {
  //if file Uri does not exist or if it is a media or avatar uri, return back the same param.
  if (!fileURI || isAvatarUri(fileURI) || isMediaUri(fileURI)) {
    return fileURI;
  }
  //if file Uri is already an absolute file URI, return the same with the 'file://' prefix.
  if (
    fileURI.includes(RNFS.CachesDirectoryPath) ||
    fileURI.includes(RNFS.TemporaryDirectoryPath) ||
    fileURI.includes(RNFS.DocumentDirectoryPath)
  ) {
    return addFilePrefix(fileURI);
  }
  //
  else {
    return addFilePrefix(RNFS.DocumentDirectoryPath + '/' + fileURI);
  }
}

/**
 * Returns a safe relative URI for items stored in document storage
 * that can accessed anywhere irrespective of file system changes unless the underlying storage is cleared.
 * If item is not in document storage, returns unchanged uri.
 * @param fileURI
 * @returns {string} relative file URI or file URI depending on whether the file is in document storage.
 */
export function getRelativeURI(
  fileURI: string,
  _location?: string, //deprecated
): string {
  if (fileURI.includes(RNFS.DocumentDirectoryPath)) {
    return removeFilePrefix(fileURI.replace(RNFS.DocumentDirectoryPath, ''));
  } else {
    return fileURI;
  }
}

/**
 * tmp directory name repeats are not handled in ios. thus, we need to handle it.
 */
async function checkRepeatInTmp(fileUri: string) {
  // check if repeat exists and delete if exists
  const doesExist = await RNFS.exists(fileUri);
  if (doesExist) {
    await RNFS.unlink(fileUri);
  }
}

/**
 * Moves a source file to the tmp directory.
 * @param source - source file absolute path
 * @returns - absolute file path with file:// prefix added or null if some error occured.
 */
export async function moveToTmp(source: string) {
  try {
    //moving to tmp directory should create a new location.
    const newPath =
      RNFS.TemporaryDirectoryPath +
      '/' +
      generateRandomHexId() +
      getFileExtension(source);
    //If a file already exist at this path, delete it.
    await checkRepeatInTmp(newPath);
    await RNFS.moveFile(source, newPath);
    return addFilePrefix(newPath);
  } catch (error) {
    console.log('Unable to move to tmp dir', error);
    return null;
  }
}

/**
 * Returns file extention or empty string if no extention exists.
 */
function getFileExtension(uri: string): string {
  const lastDotIndex = uri.lastIndexOf('.');
  const lastSlashIndex = uri.lastIndexOf('/');
  if (lastDotIndex > lastSlashIndex) {
    return uri.substring(lastDotIndex).toLowerCase();
  }
  return '';
}

/**
 * Copies a file to tmp directory.
 * Please be careful where you use this function. moveToTmp might be a better fit for most situations.
 * Try to use it mostly to move files for media directory to tmp directory.
 * @param fileUri
 * @param fileName
 * @returns - absolute file path with file:// prefix added or null if some error occured.
 */
export async function copyToTmp(
  fileUri: string | null | undefined,
): Promise<string | null> {
  try {
    if (!fileUri) {
      throw new Error('No file Uri');
    }
    const source = getSafeAbsoluteURI(fileUri);
    //moving to tmp directory should create a new location.
    const newPath =
      RNFS.TemporaryDirectoryPath +
      '/' +
      generateRandomHexId() +
      getFileExtension(fileUri);
    //If a file already exist at this path, delete it.
    await checkRepeatInTmp(newPath);
    await RNFS.copyFile(source, newPath);
    return addFilePrefix(newPath);
  } catch (error) {
    console.log('Unable to copy to tmp dir', error);
    return null;
  }
}
