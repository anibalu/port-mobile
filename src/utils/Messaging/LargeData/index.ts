import * as API from './APICalls';

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
