import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * The unprocessed messages will cache all retrieved messages that haven't
 * been processed fully.
 */
export async function createUnprocessedMessagesTable() {
  await runSimpleQuery(
    `
      CREATE TABLE IF NOT EXISTS unprocessedMessages (
        unprocessedMessage TEXT
      );
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Added the unprocessedMessages table');
    },
  );
}
