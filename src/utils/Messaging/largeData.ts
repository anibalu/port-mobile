import axios from 'axios';
import {LARGE_FILE_PRESIGNED_URL_RESOURE} from '../../configs/api';
import {encryptFile} from '../Crypto/aes';
import store from '../../store/appStore';
import {
  createTempFileUpload,
  deleteTempFileUpload,
} from '../Storage/StorageRNFS/sharedFileHandlers';

/**
 * Represents the parameters required for uploading a file to an AWS S3 bucket, including the URL and fields.
 * @interface
 * @property {string} url - The URL to which the file should be uploaded (AWS presigned post url).
 * @property {object} fields - An object containing fields and their corresponding values required for the upload.
 */
export interface UploadParams {
  url: string;
  fields: object;
}

export interface DownloadParams {
  mediaId: string;
  key: string;
}

/**
 * Asynchronously retrieves a presigned URL for downloading a large file based on its media ID.
 * @param {string} mediaId - The unique identifier (media ID) of the large file.
 * @returns {Promise<string>} A Promise that resolves to the presigned URL for downloading the file.
 * @throws {Error} If there is an issue with fetching the presigned URL.
 */
async function getDownloadPresignedUrl(mediaId: string): Promise<string> {
  const queryParams = {
    mediaId: mediaId,
  };
  const response = await axios.get(
    LARGE_FILE_PRESIGNED_URL_RESOURE + '?' + new URLSearchParams(queryParams),
  );
  return response.data;
}

/**
 * A functions that requests for a presigned URL to which a large file upload can be done.
 * @returns {Promise<UploadParams>} A Promise that resolves to the upload params to which a large file upload is done.
 * @throws {Error} If there is an issue with fetching the presigned URL.
 */
async function getUploadPresignedUrl(): Promise<UploadParams> {
  const response = await axios.post(LARGE_FILE_PRESIGNED_URL_RESOURE);
  const uploadTo: UploadParams = response.data;
  return uploadTo;
}

/**
 * Asynchronously uploads a large file to a presigned URL and returns the associated mediaId.
 *
 * @param {string} fileUri - The large file to be uploaded.
 * @returns {Promise<DownloadParams>} A Promise that resolves to the mediaId and decryption key of the uploaded file if successful.
 * @throws {Error} If there is an issue with the upload.
 */
export async function uploadLargeFile(
  fileUri: string | null,
): Promise<DownloadParams> {
  if (!fileUri) {
    throw new Error('File Uri is null');
  }
  //convert file to ciphertext
  const encrypted = await encryptFile(fileUri);
  const {path} = await createTempFileUpload(encrypted.ciphertext);
  try {
    const uploadTo: UploadParams = await getUploadPresignedUrl();
    const {url, fields} = uploadTo;
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    await s3Upload('file://' + path, formData, url);
    await deleteTempFileUpload(path);
    return {mediaId: fields.key.substring(8), key: encrypted.key};
  } catch (error) {
    await deleteTempFileUpload(path);
    console.log('Error creating mediaId and Key: ', error);
    throw new Error('Error creating media Id and Key');
  }
}

/**
 * Upload an unencrypted file
 * @param fileUri File to be uploaded
 * @param media_url Media URL to upload file to
 * @returns URL of returned media
 */
export async function uploadRawMedia(fileUri: string, media_url: any) {
  // @Future Shantanav: FIX THIS it doesn't work
  const formData = new FormData();
  Object.entries(media_url.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  await s3Upload(fileUri, formData, media_url.url);
  return media_url.fields.key;
}

async function s3Upload(
  fileUri: string,
  formData: FormData,
  url: string,
  fileName: string = 'test',
) {
  formData.append('file', {
    uri: fileUri,
    type: 'image/*',
    name: fileName,
  });
  const config = {
    headers: {'Content-Type': 'multipart/form-data'},
  };
  await axios.post(url, formData, config);
}

/**
 * Asynchronously downloads the content of a large file associated with a media ID.
 * @param {string} mediaId - The unique identifier (media ID) of the large file to be downloaded.
 * @returns {Promise<string>} A Promise that resolves to the content of the download.
 */
export async function downloadData(mediaId: string): Promise<string> {
  const downloadUrl: string = await getDownloadPresignedUrl(mediaId);
  const response = await axios.get(downloadUrl);
  const ciphertext: string = response.data;
  return ciphertext;
}

export function checkIfMediaDownloading(mediaId: string) {
  const entireState = store.getState();
  const mediaDownloading: string[] = entireState.mediaDownloading.media;
  if (mediaDownloading.includes(mediaId)) {
    return true;
  } else {
    return false;
  }
}

export function addMediatoDownloading(mediaId: string) {
  store.dispatch({
    type: 'ADD_TO_MEDIA_DOWNLOADING',
    payload: mediaId,
  });
}

export function removeMediaFromDownloading(mediaId: string) {
  store.dispatch({
    type: 'REMOVE_FROM_MEDIA_DOWNLOADING',
    payload: mediaId,
  });
}
