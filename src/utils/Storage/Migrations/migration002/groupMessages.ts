import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';
import {MessageStatus} from '@utils/Messaging/interfaces';

/**
 * Set up lineMessages storage
 * - Create the table
 * - Create an index to optimize getting sorted messages for a chat
 * - Create an index to optimize getting a specific messages
 * - Create a partial index to track journaled messages better
 */
export default async function groupMessages() {
  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS groupMessages (
      messageId CHAR(32) NOT NULL,
      chatId CHAR(32),
      contentType INT,
      data VARCHAR(2048),
      replyId CHAR(32) REFERENCES messages(messageId),
      sender BOOL,
      memberId CHAR(32),
      timestamp VARCHAR(27),
      messageStatus INT,
      expiresOn VARCHAR(27),
      hasReaction BOOL,
      FOREIGN KEY (chatID) REFERENCES connections(chatId),
      UNIQUE(chatID, messageId)
    );
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully created the groupMessages table ',
      );
    },
  );
  await runSimpleQuery(
    `
    CREATE INDEX IF NOT EXISTS group_chat_time
    ON groupMessages(chatId, timestamp);
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully created chatId, timestamp index to optimize sorted groupMessages',
      );
    },
  );
  await runSimpleQuery(
    `
    CREATE INDEX IF NOT EXISTS group_chat_message
    ON groupMessages(chatId, messageId);
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
    CREATE INDEX IF NOT EXISTS group_unsent
    ON groupMessages(messageStatus)
    WHERE messageStatus = -32 ;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully created a partial index on messageStatus to track journaled groupMessages',
      );
    },
  );
  await runSimpleQuery(
    `
    CREATE INDEX IF NOT EXISTS expired_messages
    ON groupMessages(expiresOn)
    WHERE expiresOn IS NOT NULL ;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully created a partial index on groupMessages for expiresOn is not null',
      );
    },
  );
}
