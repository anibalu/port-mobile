import {LARGE_FILE_PRESIGNED_URL_RESOURCE} from '@configs/api';
import axios from 'axios';

/**
 * Asynchronously retrieves a presigned URL for downloading a large file based on its media ID.
 * @param {string} mediaId - The unique identifier (media ID) of the large file.
 * @returns A Promise that resolves to the presigned URL for downloading the file.
 * @throws {Error} If there is an issue with fetching the presigned URL.
 */
export async function getDownloadPresignedUrl(
  mediaId: string,
): Promise<string> {
  const queryParams = {
    mediaId: mediaId,
  };
  const response = await axios.get(
    LARGE_FILE_PRESIGNED_URL_RESOURCE + '?' + new URLSearchParams(queryParams),
  );
  if (response.data.body) {
    return response.data.body;
  }
  throw new Error('ErrorFetchingDownloadPresignedUrl');
}

/**
 * A functions that requests for a presigned URL to which a large file upload can be done.
 * @returns A Promise that resolves to the upload params to which a large file upload is done.
 * @throws {Error} If there is an issue with fetching the presigned URL.
 */
export async function getUploadPresignedUrl() {
  const response = await axios.post(LARGE_FILE_PRESIGNED_URL_RESOURCE);
  if (response.data.body) {
    return response.data.body;
  }
  throw new Error('ErrorFetchingPresignedUrl');
}

export async function s3Upload(
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
 * Asynchronously downloads the content of a large file associated with a download URl.
 * @param {string} downloadUrl - download url
 * @returns {Promise<string>} A Promise that resolves to the content of the download.
 */
export async function downloadDataFromUrl(
  downloadUrl: string,
): Promise<string> {
  const response = await axios.get(downloadUrl);
  if (response.data) {
    return response.data;
  }
  throw new Error('ErrorDownloadingDataFromUrl');
}
