import {
  ContentType,
  LargeDataMessageContentTypes,
} from '@utils/Messaging/interfaces';

import {runSimpleQuery} from './dbCommon';

export interface MediaUpdate {
  type: ContentType;
  filePath: string;
  name: string;
  previewPath?: string;
}

export interface MediaEntry extends MediaUpdate {
  mediaId: string;
  createdOn: string;
  chatId?: string;
  messageId?: string;
}

/**
 * Create a new media entry
 * @param mediaId unique 32 character identifier for media
 * @param chatId optional chatId to associate to
 * @param currentTimestamp current timestamp, saved as createdOn time
 */
export async function newMedia(
  mediaId: string,
  chatId: string | null,
  messageId: string | null,
  currentTimestamp: string,
) {
  await runSimpleQuery(
    `
    INSERT INTO media
    (mediaId, chatId,messageId, createdOn) VALUES (?,?,?,?) ;
    `,
    [mediaId, chatId, messageId, currentTimestamp],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Returns an media info given a media Id.
 * @param mediaId - media Id associated with info
 * @returns - media info
 */
export async function getMedia(mediaId: string): Promise<MediaEntry | null> {
  let match: MediaEntry | null = null;
  await runSimpleQuery(
    `
    SELECT * FROM media
    WHERE mediaId = ?;
    `,
    [mediaId],
    (tx, results) => {
      if (results.rows.length > 0) {
        match = results.rows.item(0);
      }
    },
  );
  return match;
}

/**
 * Update a media entry
 * @param mediaId the media to update
 * @param update changes to be applied
 */
export async function updateMedia(mediaId: string, update: MediaUpdate) {
  if (
    !(
      LargeDataMessageContentTypes.includes(update.type) ||
      update.type === ContentType.link
    )
  ) {
    console.error('ContentType invalid for media storage');
    throw Error(
      'ContentType invalid for media storage. Incorrect call for updateMedia',
    );
  }
  await runSimpleQuery(
    `
    UPDATE media
    SET
    type = COALESCE(?, type),
    name = COALESCE(?, name),
    filePath = COALESCE(?, filePath),
    previewPath = COALESCE(?, previewPath)
    WHERE mediaId = ? ;
    `,
    [
      update.type,
      update.name ? update.name.slice(0, 256) : null,
      update.filePath,
      update.previewPath,
      mediaId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Get media for a chat of a particular type
 * @param chatId chatId to get media for
 * @param type type of media to get
 * @returns media of <type> associated with <chat> sorted by timestamp
 */
export async function getTypedMedia(
  chatId: string,
  type: ContentType,
): Promise<MediaEntry[]> {
  if (
    !(LargeDataMessageContentTypes.includes(type) || type === ContentType.link)
  ) {
    console.error('ContentType invalid for media storage');
    throw Error(
      'ContentType invalid for media storage. Incorrect call for getTypedMedia',
    );
  }
  const matches: MediaEntry[] = [];
  await runSimpleQuery(
    `
    SELECT * FROM media
    WHERE chatId = ? AND type = ?
    ORDER BY createdOn DESC ;
    `,
    [chatId, type],
    (tx, results) => {
      for (let i = 0; i < results.rows.length; i++) {
        matches.push(results.rows.item(i));
      }
    },
  );
  return matches;
}

/**
 * Delete a media entry
 * @param mediaId media to delete
 */
export async function deleteMedia(mediaId: string) {
  await runSimpleQuery(
    `
    DELETE FROM media
    WHERE mediaId = ? ;
    `,
    [mediaId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}

/**
 * Delete all media entries for a chat
 * @param chatId 32 character unique identifier for a chat
 */
export async function deleteMediaForChat(chatId: string) {
  await runSimpleQuery(
    `
    DELETE FROM media
    WHERE chatId = ? ;
    `,
    [chatId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, retults) => {},
  );
}

/**
 * Get all images and videos for a chat
 * @param chatId 32 char identifier for a chat
 * @returns All images and videos for this chat
 */
export async function getImagesAndVideos(chatId: string) {
  const matches: MediaEntry[] = [];
  if (ContentType.image !== 3) {
    console.error(
      'ContentType for image incorrectly set to something other than 3',
    );
    throw Error('ContentType.image is not 3');
  }
  await runSimpleQuery(
    `
    SELECT * FROM media
    WHERE chatId = ? AND (type = ? OR type = ?)
    ORDER BY createdOn DESC ;
    `,
    [chatId, ContentType.image, ContentType.video],
    (tx, results) => {
      for (let i = 0; i < results.rows.length; i++) {
        matches.push(results.rows.item(i));
      }
    },
  );
  return matches;
}
