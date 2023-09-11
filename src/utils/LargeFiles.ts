/**
 * This module provides helpers to upload and download large files.
 * @module LargeFiles
 */
import axios from 'axios';
import {LARGE_FILE_PRESIGNED_URL_RESOURE} from '../configs/api';
import RNFS from 'react-native-fs';
import {tempDir} from '../configs/paths';
import {ContentType} from './MessageInterface';

/**
 * The path to the temporary directory within the Document Directory of the app.
 * @type {string}
 */
const path = RNFS.DocumentDirectoryPath + '/' + tempDir;

/**
 * The encoding to be used when reading data, specified as 'base64'.
 * @type {string}
 */
const READ_ENCODING = 'base64';

/**
 * The encoding to be used when writing data, specified as 'utf8'.
 * @type {string}
 */
const WRITE_ENCODING = 'utf8';

/**
 * Represents a large file with its properties.
 *
 * @interface
 * @property {string} uri - The URI (Uniform Resource Identifier) of the large file.
 * @property {string} type - The MIME type of the large file.
 * @property {string} name - The name of the large file.
 */
export interface largeFile {
  uri: string;
  type: string;
  name: string;
}
/**
 * Represents the data of a large file with its properties, where the file data is base64 encoded.
 *
 * @interface
 * @property {string} name - The name of the large file.
 * @property {string} type - The MIME type of the large file.
 * @property {string} data - The base64-encoded data of the large file.
 */
export interface largeFileData {
  name: string;
  type: string;
  data: string; //base64 encoded
}
/**
 * Represents the parameters required for uploading a file to an AWS S3 bucket, including the URL and fields.
 *
 * @interface
 * @property {string} url - The URL to which the file should be uploaded (AWS presigned post url).
 * @property {object} fields - An object containing fields and their corresponding values required for the upload.
 */
export interface uploadParams {
  url: string;
  fields: object;
}
/**
 * Represents the parameters returned on a successful large file upload.
 *
 * @interface
 * @property {string} mediaId - The identifier attached to the media.
 * @property {number} size - the size of the media in bytes.
 */
export interface uploadResponse {
  mediaId: string;
  size: number;
}
export interface convertedFileResponse {
  filePath: string;
  type: string;
}
/**
 * A functions that requests for a presigned URL to which a large file upload can be done.
 * @returns {Promise<uploadParams>} A Promise that resolves to the upload params to which a large file upload is done.
 */
export async function getUploadPresignedUrl(): Promise<uploadParams> {
  const response = await axios.post(LARGE_FILE_PRESIGNED_URL_RESOURE);
  const uploadTo: uploadParams = response.data;
  return uploadTo;
}

/**
 * Asynchronously retrieves a presigned URL for downloading a large file based on its media ID.
 *
 * @param {string} mediaId - The unique identifier (media ID) of the large file.
 * @returns {Promise<string>} A Promise that resolves to the presigned URL for downloading the file.
 * @throws {Error} If there is an issue with fetching the presigned URL.
 */
export async function getDownloadPresignedUrl(
  mediaId: string,
): Promise<string> {
  const queryParams = {
    mediaId: mediaId,
  };
  const response = await axios.get(
    LARGE_FILE_PRESIGNED_URL_RESOURE + '?' + new URLSearchParams(queryParams),
  );
  return response.data;
}

/**
 * Asynchronously initializes a temporary directory if it does not already exist.
 *
 * @returns {Promise<void>} A Promise that resolves when the temporary directory is successfully initialized or already exists.
 * @throws {Error} If there is an issue with checking the existence of the directory or creating it.
 */
export async function initialiseTempDirAsync() {
  const folderExists = await RNFS.exists(path);
  if (folderExists) {
    return;
  } else {
    await RNFS.mkdir(path);
  }
}
/**
 * Generates unique file ID based on the current time.
 *
 * @returns {string} A unique file ID.
 */
async function getTempFileId() {
  const date = new Date();
  return date.getTime().toString();
}
/**
 * Asynchronously creates a temporary file that contains json.stringified largeFileData of a give largeFile.
 *
 * @param {largeFile} file - The large file to be uploaded.
 * @returns {Promise<string>} A Promise that resolves to the URI of the temporary file.
 * @throws {Error} If there is an issue with creating or reading the temporary file.
 */
export async function createTempFileUpload(file: largeFile) {
  await initialiseTempDirAsync();
  const tempFilePath = path + '/' + getTempFileId() + '_' + file.name;
  const largeFile: largeFileData = {
    name: file.name,
    type: file.type,
    data: await RNFS.readFile(file.uri, READ_ENCODING),
  };
  await RNFS.writeFile(tempFilePath, JSON.stringify(largeFile), WRITE_ENCODING);
  const fileUri: string = 'file://' + tempFilePath;
  return fileUri;
  /**
   * @todo add encryption
   */
}
export async function initialiseLargeFileDirAsync(lineId: string) {
  const largeFileDir = RNFS.DocumentDirectoryPath + '/' + 'largeFiles';
  const folderExists = await RNFS.exists(largeFileDir);
  if (!folderExists) {
    await RNFS.mkdir(largeFileDir);
  }
  const mediaDir = largeFileDir + '/' + lineId + '/' + 'media';
  const mediaDirExists = await RNFS.exists(mediaDir);
  if (!mediaDirExists) {
    await RNFS.mkdir(mediaDir);
  }
  const fileDir = largeFileDir + '/' + lineId + '/' + 'files';
  const fileDirExists = await RNFS.exists(fileDir);
  if (!fileDirExists) {
    await RNFS.mkdir(fileDir);
  }
}
export async function tempFileToLocalFile(
  lineId: string,
  fileUri: string,
  type: ContentType | string,
) {
  await initialiseLargeFileDirAsync(lineId);
  if (type === ContentType.OTHER_FILE) {
    const fileData: string = await RNFS.readFile(fileUri.substring(7));
    const fileObj: largeFileData = JSON.parse(fileData);
    const filePath =
      RNFS.DocumentDirectoryPath +
      '/' +
      'largeFiles' +
      '/' +
      lineId +
      '/media/' +
      fileObj.name;
    await RNFS.writeFile(filePath, fileObj.data, 'base64');
    const ret: convertedFileResponse = {filePath: filePath, type: fileObj.type};
    return ret;
  }
  if (type === ContentType.IMAGE) {
    const fileData: string = await RNFS.readFile(fileUri.substring(7));
    const fileObj: largeFileData = JSON.parse(fileData);
    const filePath =
      RNFS.DocumentDirectoryPath +
      '/' +
      'largeFiles' +
      '/' +
      lineId +
      '/media/' +
      fileObj.name;
    await RNFS.writeFile(filePath, fileObj.data, 'base64');
    const ret: convertedFileResponse = {filePath: filePath, type: fileObj.type};
    return ret;
  } else {
    const fileObj: largeFileData = JSON.parse(
      await RNFS.readFile(fileUri.substring(7), WRITE_ENCODING),
    );
    const filePath =
      RNFS.DocumentDirectoryPath +
      '/' +
      'largeFiles' +
      '/' +
      lineId +
      '/files/' +
      fileObj.name;
    await RNFS.writeFile(filePath, fileObj.data);
    const ret: convertedFileResponse = {filePath: filePath, type: fileObj.type};
    return ret;
  }
}
export async function toLocalFile(
  lineId: string,
  fileObj: largeFileData,
  type: ContentType | string,
) {
  await initialiseLargeFileDirAsync(lineId);
  if (type === ContentType.OTHER_FILE) {
    const filePath =
      RNFS.DocumentDirectoryPath +
      '/' +
      'largeFiles' +
      '/' +
      lineId +
      '/media/' +
      fileObj.name;
    await RNFS.writeFile(filePath, fileObj.data, 'base64');
    const ret: convertedFileResponse = {filePath: filePath, type: fileObj.type};
    return ret;
  }
  if (type === ContentType.IMAGE) {
    const filePath =
      RNFS.DocumentDirectoryPath +
      '/' +
      'largeFiles' +
      '/' +
      lineId +
      '/media/' +
      fileObj.name;
    await RNFS.writeFile(filePath, fileObj.data, 'base64');
    const ret: convertedFileResponse = {filePath: filePath, type: fileObj.type};
    return ret;
  } else {
    const filePath =
      RNFS.DocumentDirectoryPath +
      '/' +
      'largeFiles' +
      '/' +
      lineId +
      '/files/' +
      fileObj.name;
    await RNFS.writeFile(filePath, fileObj.data);
    const ret: convertedFileResponse = {filePath: filePath, type: fileObj.type};
    return ret;
  }
}
/**
 * Asynchronously creates a temporary file and populates it with downloaded largeFileData and returns the file's location.
 *
 * @param {string} data - The data to be written to the temporary file.
 * @param {string} mediaId - The identifier associated with the downloaded data.
 * @returns {Promise<string>} A Promise that resolves to the location of the temporary file.
 * @throws {Error} If there is an issue with creating or writing the temporary file.
 * @deprecated
 */
export async function createTempFileDownload(data: string, mediaId: string) {
  await initialiseTempDirAsync();
  const tempFilePath = path + '/' + getTempFileId() + '_' + mediaId + '.txt';
  const newer = data;
  await RNFS.writeFile(tempFilePath, newer, WRITE_ENCODING);
  const fileUri: string = 'file://' + tempFilePath;
  return fileUri;
}

/**
 * Asynchronously uploads a large file to a presigned URL and tracks the progress.
 *
 * @param {string} fileUri - The large file to be uploaded.
 * @returns {Promise<string | null>} A Promise that resolves to the mediaId of the uploaded file if successful, or null if an error occurs.
 */
export async function uploadLargeFile(
  fileUri: string,
): Promise<uploadResponse | null> {
  try {
    const uploadTo: uploadParams = await getUploadPresignedUrl();
    let uploadSize: number = 0;
    // Prepare the form data for POST request
    const {url, fields} = uploadTo;
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('file', {
      uri: fileUri,
      type: 'text/plain',
      name: getTempFileId() + '.txt',
    });
    const config = {
      headers: {'Content-Type': 'multipart/form-data'},
      onUploadProgress: progressEvent => {
        uploadSize = progressEvent.total;
      },
    };
    await axios.post(url, formData, config);
    console.log('Upload successful');
    return {mediaId: fields.key.substring(8), size: uploadSize};
  } catch (error) {
    console.log('Unable to upload file: ', error);
    //journal this message.
    return null;
  }
}

/**
 * Asynchronously downloads a large file associated with a media ID and tracks the download progress.
 *
 * @param {string} mediaId - The unique identifier (media ID) of the large file to be downloaded.
 * @returns {Promise<string | null>} A Promise that resolves to the location of the downloaded file if successful, or null if an error occurs.
 */
export async function downloadLargeFile(
  mediaId: string,
): Promise<largeFileData | null> {
  try {
    console.log('download starting...');
    const downloadUrl: string = await getDownloadPresignedUrl(mediaId);
    console.log('download: ', downloadUrl);
    const response = await axios.get(downloadUrl);
    console.log('download successful');
    return response.data;
  } catch (error) {
    console.log('Unable to download file: ', error);
    return null;
  }
}

//testing function
// export async function pickAndUploadFile() {
//   try {
//     const result: DocumentPickerResponse[] = await DocumentPicker.pick({
//       type: [DocumentPicker.types.allFiles],
//     });
//     if (result[0]) {
//       const file: largeFile = {
//         uri: result[0].uri,
//         type: result[0].type || '',
//         name: result[0].name || '',
//       };
//       /**
//        * @todo This file need to get encrypted before upload.
//        */
//       const fileUri = await createTempFileUpload(file);
//       const ret = await uploadLargeFile(fileUri);
//       if (ret !== null) {
//         console.log('mediaId1: ', ret.mediaId);
//         const ret1 = await downloadLargeFile(ret.mediaId);
//         console.log("location: ", ret1);
//       }
//       return ret;
//     }
//     return null;
//   } catch (error) {
//     console.log('File picker error: ', error);
//     return null;
//   }
// }
