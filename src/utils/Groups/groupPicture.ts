import {
  getFileNameFromUri,
  getSafeAbsoluteURI,
  isMediaUri,
  moveToLargeFileDir,
} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {createPreview} from '@utils/ImageUtils';
import {generateRandomHexId} from '@utils/IdGenerator';
import {generateISOTimeStamp} from '@utils/Time';
import {getMedia, saveNewMedia, updateMedia} from '@utils/Storage/media';
import {ContentType} from '@utils/Messaging/interfaces';
import LargeDataUpload from '@utils/Messaging/LargeData/LargeDataUpload';

/**
 * Save an actual image to group media storage and return mediaId.
 * @param chatId
 * @returns - mediaId of the image
 */
export async function saveGroupImage(chatId: string, imageUri: string) {
  //create local copy
  const groupPictureUri = await moveToLargeFileDir(chatId, imageUri, null);
  //create local preview
  const groupPreviewUri = await createPreview(ContentType.image, {
    url: getSafeAbsoluteURI(groupPictureUri),
    chatId: chatId,
  });
  const mediaId = generateRandomHexId();
  //add to media table
  await saveNewMedia(mediaId, chatId, null, generateISOTimeStamp());
  await updateMedia(mediaId, {
    type: ContentType.displayImage,
    filePath: groupPictureUri,
    name: getFileNameFromUri(groupPictureUri),
    previewPath: groupPreviewUri,
  });
}

/**
 * Upload a group image and return the encryption key used to encrypt the image.
 * @param groupId - groupId of the group.
 * @param groupImageUri - group image uri.
 * @returns - key if succeeds, null otherwise.
 */
export async function uploadGroupImage(
  groupId: string,
  groupImageUri: string | null | undefined,
): Promise<string | null> {
  try {
    if (isMediaUri(groupImageUri)) {
      const media = await getMedia(groupImageUri);
      if (!media) {
        throw new Error('No media associated with media Uri');
      }
      //upload encrypted group picture and get encryption key.
      const uploader = new LargeDataUpload(media.filePath, media.name);
      await uploader.uploadGroupData(groupId);
      return uploader.getKeyNotNull();
    }
  } catch (error) {
    console.error('[Error uploading group profile picture]: ', error);
  }
  return null;
}
