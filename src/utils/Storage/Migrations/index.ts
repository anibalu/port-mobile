import {runSimpleQuery} from '../DBCalls/dbCommon';
// Increment this counter everytime you add a migration
const currentVersion = 1;
console.log('Current DB version: ', currentVersion);

export default async function runMigrations() {
  migration1();
}

/**
 * Migration 1:
 * - create a connections table
 * - create a lineMessages table
 *  - have an index on (chatId, timestamp)
 *  - have an index on (messageId)
 * - create a groupMessages table
 *  - have an index on (chatId, timestamp)
 *  - have an index on (messageId)
 */
async function migration1() {
  if (currentVersion < 1) {
    return;
  }
  await runSimpleQuery(
    `CREATE TABLE IF NOT EXISTS connections (
      chatId CHAR(32) PRIMARY KEY,
      connectionType INT,
      name VARCHAR(64),
      permissions VARCHAR(1024),
      text VARCHAR(128),
      recentMessageType INT,
      pathToDisplayPic VARCHAR(256),
      readStatus INT,
      authenticated BOOL,
      timestamp VARCHAR(64),
      newMessageCount INT,
      disconnected BOOL
      );`,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {
      console.log('Successfully created connections table');
    },
  );
  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS lineMessages (
      messageId VARCHAR(128) NOT NULL,
      chatId CHAR(32),
      contentType INT,
      data VARCHAR(2048),
      replyId VARCHAR(128) REFERENCES messages(messageId),
      sender BOOL,
      memberId CHAR(32),
      timestamp VARCHAR(64),
      sendStatus INT,
      FOREIGN KEY (chatID) REFERENCES connections(chatId),
      UNIQUE(chatID, messageId)
    );
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('successfully created lineMessages table');
    },
  );
  await runSimpleQuery(
    `
    CREATE INDEX IF NOT EXISTS line_chat_time
    ON lineMessages(chatId, timestamp);
    CREATE INDEX IF NOT EXISTS line_chat_message
    ON lineMessages(chatId, messageId);
    CREATE INDEX IF NOT EXISTS line_unsent
    ON lineMessages(sendStatus, chatId, messageId)
    WHERE sendStatus != 0;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('successfully created 3 indexes on lineMessages');
    },
  );
}
