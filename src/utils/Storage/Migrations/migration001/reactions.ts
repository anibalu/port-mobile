import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Set up lineMessages storage
 * - Create the table
 * - Create an index to optimize getting sorted messages for a chat
 * - Create an index to optimize getting a specific messages
 * - Create a partial index to track journaled messages better
 */
export default async function reactions() {
  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS reactions (
      chatId CHAR(32) NOT NULL,
      messageId CHAR(32) NOT NULL,
      cryptoId CHAR(32),
      reaction VARCHAR(4),
      UNIQUE(chatId, messageId, cryptoId)
    );
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully created the reactions table ');
    },
  );
}
