import {ContentType} from '@utils/Messaging/interfaces';

import {MediaEntry,MediaUpdate} from './DBCalls/media';
import * as dbCalls from './DBCalls/media';
import {deleteFile} from './StorageRNFS/sharedFileHandlers';

const MEDIA_ID_LENGTH = 32;

/**
 * Save a new media file
 * @param mediaId unique
 * @param chatId can be for a chat or a group
 * @param currentTimestamp
 */
export async function saveNewMedia(
  mediaId: string,
  chatId: string | null,
  messageId: string | null,
  currentTimestamp: string,
) {
  await dbCalls.newMedia(mediaId, chatId, messageId, currentTimestamp);
}

/**
 * Update media data
 * @param mediaId
 * @param update changes to be applied
 */
export async function updateMedia(mediaId: string, update: MediaUpdate) {
  await dbCalls.updateMedia(mediaId, update);
}

/**
 * Returns an media info given a media Id.
 * @param mediaId - media Id associated with info
 * @returns - media info
 */
export async function getMedia(
  mediaId?: string | null,
): Promise<MediaEntry | null> {
  if (!mediaId) {
    return null;
  }
  const newMediaId = mediaId.replace(/^media:\/\//, '');
  if (newMediaId.length !== MEDIA_ID_LENGTH) {
    return null;
  }
  return await dbCalls.getMedia(newMediaId);
}

/**
 * Returns all media of a specified type from a given chatID
 * @param chatId
 * @param type ContentType that determines the file type to be searched for
 * @returns {Promise<MediaEntry[]>} list
 */
export async function getMediaForChat(
  chatId: string,
  type: ContentType,
): Promise<MediaEntry[]> {
  return await dbCalls.getTypedMedia(chatId, type);
}

/**
 * Returns all images and videos for a specified type from a given chatID
 * @param chatId
 * @returns {Promise<MediaEntry[]>} list
 */
export async function getImagesAndVideos(
  chatId: string,
): Promise<MediaEntry[]> {
  return await dbCalls.getImagesAndVideos(chatId);
}

/**
 * Deletes a given mediaId from the table
 * @param mediaId
 */
export async function deleteMedia(mediaId?: string | null) {
  if (!mediaId) {
    return;
  }
  const newMediaId = mediaId.replace(/^media:\/\//, '');
  if (newMediaId.length !== MEDIA_ID_LENGTH) {
    return;
  }
  const mediaInfo = await dbCalls.getMedia(mediaId);
  if (mediaInfo?.filePath) {
    await deleteFile(mediaInfo?.filePath);
  }
  if (mediaInfo?.previewPath) {
    await deleteFile(mediaInfo?.previewPath);
  }
  await dbCalls.deleteMedia(mediaId);
}
