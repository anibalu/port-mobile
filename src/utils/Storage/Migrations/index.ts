import {runSimpleQuery} from '../DBCalls/dbCommon';
// Increment this counter everytime you add a migration.
// If this file has been modified, hopefully this counter has ticked.
// MOST_RECENT_MIGRATION_NUMBER = 1

// To run a migration, write a suitible callback and add it to the list.
// Make sure to increment the counter above to make sure we don't do weird things.
const migrations: [number, () => Promise<void>][] = [
  [1, migration1],
  [2, migration2],
];

export default async function runMigrations() {
  await createMigrationsTable();
  console.log('created migrations table');
  for (let migration of migrations) {
    console.log('trying to run migration: ', migration[0]);
    await runMigration(migration[0], migration[1]);
  }
}

async function createMigrationsTable() {
  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS migrations (
      migrationId INT PRIMARY KEY
    );
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}

async function runMigration(id: number, callback: () => Promise<void>) {
  let hasRun;
  await runSimpleQuery(
    `
    SELECT migrationId
    FROM migrations
    WHERE migrationId = ?
    ;
    `,
    [id],

    (tx, result) => {
      if (result.rows.length > 0) {
        hasRun = true;
      } else {
        hasRun = false;
      }
    },
  );

  if (!hasRun) {
    await callback();
    console.log('Ran migration: ', id);
    await runSimpleQuery(
      'INSERT INTO migrations ( migrationId ) VALUES (?) ;',
      [id],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (tx, result) => {},
    );
  } else {
    console.log("Didn't need to run migration: ", id);
  }
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

/**
 * Migration 2:
 * - rename a lineMessages table column sendStatus to messageStatus
 */
async function migration2() {
  await runSimpleQuery(
    `
    ALTER TABLE lineMessages
    RENAME COLUMN sendStatus TO messageStatus; 
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('successfully modified lineMessages table');
    },
  );
  await runSimpleQuery(
    `
    ALTER TABLE lineMessages
    ADD COLUMN deliveredTimestamp VARCHAR(64);
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('successfully added deliveredTimestamp');
    },
  );
  await runSimpleQuery(
    `
    ALTER TABLE lineMessages
    ADD COLUMN readTimestamp VARCHAR(64);
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('successfully added readTimestamp');
    },
  );
}
