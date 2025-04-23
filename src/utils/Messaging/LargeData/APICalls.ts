import axios from 'axios';

import {
  GROUP_PICTURE_RESOURCE,
  LARGE_FILE_PRESIGNED_URL_RESOURCE,
} from '@configs/api';

import {getToken} from '@utils/ServerAuth';

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
 * Asynchronously retrieves a presigned URL for downloading a group picture resource.
 * @param {string} groupId - the groupId of group
 * @returns A Promise that resolves to the presigned URL for downloading the file.
 * @throws {Error} If there is an issue with fetching the presigned URL.
 */
export async function getDownloadPresignedUrlFromGroupPictureResource(
  groupId: string,
): Promise<string> {
  const token = await getToken();
  const queryParams = {
    groupId: groupId,
  };
  const response = await axios.get(
    GROUP_PICTURE_RESOURCE + '?' + new URLSearchParams(queryParams),
    {
      headers: {Authorization: `${token}`},
    },
  );
  if (response.data.pictureDownloadUrl) {
    return response.data.pictureDownloadUrl;
  }
  throw new Error('ErrorFetchingDownloadPresignedUrlFromGroupPictureResource');
}

export interface UploadUrl {
  mediaId?: string;
  uploadParams: any;
}
/**
 * A functions that requests for a presigned URL to which a large file upload can be done.
 * @returns A Promise that resolves to the upload params to which a large file upload is done.
 * @throws {Error} If there is an issue with fetching the presigned URL.
 */
export async function getUploadPresignedUrl(): Promise<UploadUrl> {
  const response = await axios.post(LARGE_FILE_PRESIGNED_URL_RESOURCE);
  if (response?.data?.body?.url && response?.data?.body?.mediaId) {
    return {
      uploadParams: response.data.body.url,
      mediaId: response.data.body.mediaId,
    };
  }
  throw new Error('ErrorFetchingPresignedUrl');
}

/**
 * A functions that requests for a presigned URL from a group picture resource to which a large file upload can be done.
 * @returns A Promise that resolves to the upload params to which a large file upload is done.
 * @throws {Error} If there is an issue with fetching the presigned URL.
 */
export async function getUploadPresignedUrlFromGroupPictureResource(
  groupId: string,
): Promise<UploadUrl> {
  const token = await getToken();
  const response = await axios.patch(
    GROUP_PICTURE_RESOURCE,
    {
      groupId: groupId,
    },
    {
      headers: {Authorization: `${token}`},
    },
  );
  if (response?.data?.pictureUpdateData) {
    return {uploadParams: response.data.pictureUpdateData};
  }
  throw new Error('ErrorFetchingPresignedUrlFromResource');
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


