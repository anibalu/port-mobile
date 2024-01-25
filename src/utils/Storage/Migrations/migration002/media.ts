import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Setup to track media
 * - Set up the media table
 * - Create an index on chatId
 */
export default async function media() {
  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS media (
      mediaId CHAR(32) PRIMARY KEY,
      messageId CHAR(32),
      createdOn VARCHAR(27),
      chatId CHAR(32),
      type int,
      name VARCHAR(256),
      filePath VARCHAR(256),
      previewPath VARCHAR(256)
    ) ;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully added the media table');
    },
  );

  await runSimpleQuery(
    `
    CREATE INDEX IF NOT EXISTS media_chat_id
    ON media(chatId, createdOn);
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully created chatId, messageId index to speed up point queries',
      );
    },
  );
}
