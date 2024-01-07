import {encryptFile} from '../../Crypto/aes';
import {
  createTempFileUpload,
  deleteTempFileUpload,
} from '../../Storage/StorageRNFS/sharedFileHandlers';
import {DownloadParams} from '../interfaces';
import * as API from './APICalls';

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
  const path = await createTempFileUpload(encrypted.ciphertext);
  try {
    const uploadParams = await API.getUploadPresignedUrl();
    console.log('upload: ', uploadParams);
    const mediaId: string = uploadParams.mediaId;
    console.log('mediaId: ', mediaId);
    const url: string | null = uploadParams.url.url
      ? uploadParams.url.url
      : null;
    const fields: object | null = uploadParams.url.fields
      ? uploadParams.url.fields
      : null;
    if (!url || !fields) {
      throw new Error('ImproperUploadParams');
    }
    console.log('url: ', url);
    console.log('fields: ', fields);
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    await API.s3Upload('file://' + path, formData, url);
    await deleteTempFileUpload(path);
    return {mediaId: mediaId, key: encrypted.key};
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
  await API.s3Upload(fileUri, formData, media_url.url);
  return media_url.fields.key;
}

/**
 * Asynchronously downloads the content of a large file associated with a media ID.
 * @param {string} mediaId - The unique identifier (media ID) of the large file to be downloaded.
 * @returns {Promise<string>} A Promise that resolves to the content of the download.
 */
export async function downloadData(mediaId: string): Promise<string | null> {
  try {
    const downloadUrl: string = await API.getDownloadPresignedUrl(mediaId);
    const ciphertext = await API.downloadDataFromUrl(downloadUrl);
    return ciphertext;
  } catch (error) {
    console.log('error downloading data: ', error);
    return null;
  }
}
