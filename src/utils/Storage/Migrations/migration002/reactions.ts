import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Set up reactions table
 * - Create the table for reactions for both groups and lines
 * - Create an index to get reactions for a message faster
 */
export default async function reactions() {
  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS reactions (
      chatId CHAR(32) NOT NULL,
      messageId CHAR(32) NOT NULL,
      senderId VARCHAR(32) NOT NULL,
      reaction VARCHAR(4) NOT NULL,
      UNIQUE(chatId, messageId, senderId)
    );
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully created the reactions table ');
    },
  );

  await runSimpleQuery(
    `
    CREATE INDEX IF NOT EXISTS reactions_message
    ON reactions(chatId, messageId);
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully created an index on the reactions table ',
      );
    },
  );
}
