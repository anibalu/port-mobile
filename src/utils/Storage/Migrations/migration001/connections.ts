import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Set up the connections table
 */
export default async function connections() {
  await runSimpleQuery(
    `CREATE TABLE IF NOT EXISTS connections (
      chatId CHAR(32) PRIMARY KEY,
      connectionType INT,
      name VARCHAR(64),
      text VARCHAR(128),
      recentMessageType INT,
      pathToDisplayPic VARCHAR(256),
      readStatus INT,
      authenticated BOOL,
      timestamp VARCHAR(64),
      newMessageCount INT,
      disconnected BOOL,
      latestMessageId CHAR(32),
      folderId CHAR(32),
      FOREIGN KEY (folderId) REFERENCES folders(folderId)
      );`,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {
      console.log('[DB MIGRATION] Successfully created the connections table ');
    },
  );
}
