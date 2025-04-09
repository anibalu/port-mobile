import {MessageStatus} from '@utils/Messaging/interfaces';
import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Set up lineMessages storage
 * - Create the table
 * - Create an index to optimize getting sorted messages for a chat
 * - Create an index to optimize getting a specific messages
 * - Create a partial index to track journaled messages better
 */
export default async function lineMessages() {
  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS lineMessages (
      messageId CHAR(32) NOT NULL,
      chatId CHAR(32),
      contentType INT,
      data VARCHAR(2048),
      replyId CHAR(32) REFERENCES lineMessages(messageId),
      sender BOOL,
      timestamp VARCHAR(27),
      messageStatus INT,
      deliveredTimestamp VARCHAR(27),
      readTimestamp VARCHAR(27),
      shouldAck BOOL,
      hasReaction BOOL,
      expiresOn VARCHAR(27),
      mtime VARCHAR(27),
      FOREIGN KEY (chatID) REFERENCES connections(chatId),
      UNIQUE(chatId, messageId)
    );
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully created the lineMessages table ',
      );
    },
  );
  await runSimpleQuery(
    `
    CREATE INDEX IF NOT EXISTS line_chat_time
    ON lineMessages(chatId, timestamp);
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully created chatId, timestamp index to optimize sorted messages',
      );
    },
  );
  await runSimpleQuery(
    `
    CREATE INDEX IF NOT EXISTS line_chat_message
    ON lineMessages(chatId, messageId);
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully created chatId, messageId index to speed up point queries',
      );
    },
  );
  if (MessageStatus.journaled !== -32) {
    console.error(
      'MessageStatus for journaled incorrectly set to something other than -32',
    );
    throw Error('MessageStatus.journaled is not -32');
  }
  await runSimpleQuery(
    `
    CREATE INDEX IF NOT EXISTS line_unsent
    ON lineMessages(messageStatus)
    WHERE messageStatus = -32 ;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully created a partial index on messageStatus to track journaled messages',
      );
    },
  );
  await runSimpleQuery(
    `
    CREATE INDEX IF NOT EXISTS expired_messages
    ON lineMessages(expiresOn)
    WHERE expiresOn IS NOT NULL ;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully created a partial index on lineMessages for expiresOn is not null',
      );
    },
  );
}
