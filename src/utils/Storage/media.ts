import {MediaEntry, MediaUpdate} from '@utils/Media/interfaces';
import * as dbCalls from './DBCalls/media';
import {ContentType} from '@utils/Messaging/interfaces';

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
 * Returns all media of a specified type from a given chatID
 * @param chatId
 * @param type ContentType that determines the file type to be searched for
 * @returns {Promise<MediaEntry[]>} list
 */
export async function getMedia(
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
export async function deleteMedia(mediaId: string) {
  await dbCalls.deleteMedia(mediaId);
}
