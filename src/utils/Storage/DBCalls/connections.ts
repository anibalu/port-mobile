import {runSimpleQuery} from './dbCommon';
import {
  ConnectionInfo,
  ConnectionInfoUpdate,
} from '@utils/Connections/interfaces';

// Enum to define actions that can be performed on the new message count
export enum NewMessageCountAction {
  // Reset the new message count to 0
  reset = 0,

  // Increment the new message count by 1
  increment = 1,

  // Leave the new message count unchanged
  unchanged = 2,
}

function toBool(a: number | boolean | null | undefined): boolean {
  if (a) {
    return true;
  } else {
    return false;
  }
}

function toNumber(a: number | null): number {
  if (a === null) {
    return 0;
  }
  return a;
}
/**
 * Get all of the user's connections
 * @returns All current connections
 */
export async function getConnections(): Promise<ConnectionInfo[]> {
  const connections: ConnectionInfo[] = [];
  await runSimpleQuery(
    `SELECT * FROM connections
    ORDER BY timestamp DESC;`,
    [],
    (tx, results) => {
      const len = results.rows.length;
      let entry;
      for (let i = 0; i < len; i++) {
        entry = results.rows.item(i);
        entry.authenticated = toBool(entry.authenticated);
        entry.disconnected = toBool(entry.disconnected);
        connections.push(results.rows.item(i));
      }
    },
  );
  return connections;
}

/**
 * Get a connection if it exists
 * @param chatId The id of the chat to get
 * @returns If found, the connection queried
 */
export async function getConnection(
  chatId: string,
): Promise<ConnectionInfo | null> {
  let connection: ConnectionInfo | null = null;
  await runSimpleQuery(
    `
    SELECT * FROM connections
    WHERE chatId = ?;
    `,
    [chatId],

    (tx, results) => {
      const len = results.rows.length;
      let entry;
      if (len > 0) {
        entry = results.rows.item(0);
        entry.authenticated = toBool(entry.authenticated);
        entry.disconnected = toBool(entry.disconnected);
        connection = entry;
      }
    },
  );
  return connection;
}

/**
 * Add a new connection for a user
 * @param connection The connection to add
 */
export async function addConnection(connection: ConnectionInfo) {
  await runSimpleQuery(
    `
    INSERT INTO connections (
      chatId,
      connectionType,
      name,
      text,
      recentMessageType,
      pathToDisplayPic,
      readStatus,
      authenticated,
      timestamp,
      newMessageCount,
      disconnected,
      latestMessageId,
      folderId
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);`,
    [
      connection.chatId,
      connection.connectionType,
      connection.name,
      connection.text,
      connection.recentMessageType,
      connection.pathToDisplayPic,
      connection.readStatus,
      connection.authenticated,
      connection.timestamp,
      connection.newMessageCount,
      connection.disconnected,
      connection.latestMessageId,
      connection.folderId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}

export async function getNewMessageCount(folderId?: string) {
  let count = 0;
  if (folderId) {
    await runSimpleQuery(
      `
      SELECT
      SUM(newMessageCount) AS totalNewMessageCount
      FROM
      connections
      WHERE
      folderId = ?; 
      `,
      [folderId],

      (tx, results) => {
        const len = results.rows.length;
        if (len > 0) {
          count = toNumber(results.rows.item(0).totalNewMessageCount);
        }
      },
    );
  } else {
    await runSimpleQuery(
      `
      SELECT
      SUM(newMessageCount) AS totalNewMessageCount
      FROM
      connections
      `,
      [],

      (tx, results) => {
        const len = results.rows.length;
        if (len > 0) {
          count = toNumber(results.rows.item(0).totalNewMessageCount);
        }
      },
    );
  }
  return count;
}

/**
 * Delete a chat
 * @param chatId The chat id of the entry to delete
 */
export async function deleteConnection(chatId: string) {
  await runSimpleQuery(
    `
    DELETE FROM connections
    WHERE chatId = ?;
    `,
    [chatId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}

/**
 * Updates connection timestamp and new message count appropriately
 * It does not move the chat to the top with new generated timestamp
 * @param {ConnectionInfoUpdate} update - The update object containing new values for the connection.
 * @param {countAction} [countAction=NewMessageCountAction.unchanged] The action to perform on the message count.
 */
export async function updateConnection(
  update: ConnectionInfoUpdate,
  countAction: NewMessageCountAction = NewMessageCountAction.unchanged,
) {
  await runSimpleQuery(
    `
     UPDATE connections
    SET
    name = COALESCE(?, name),
    text = COALESCE(?, text),
    recentMessageType = COALESCE(?, recentMessageType),
    pathToDisplayPic = COALESCE(?, pathToDisplayPic),
    readStatus = COALESCE(?, readStatus),
    authenticated = COALESCE(?, authenticated),
    timestamp = COALESCE(?, timestamp),
    newMessageCount = CASE
      WHEN ? = 1 THEN newMessageCount + 1
      WHEN ? = 0 THEN 0
      ELSE newMessageCount
    END,
    disconnected = COALESCE(?, disconnected),
    latestMessageId = COALESCE(?, latestMessageId),
    folderId = COALESCE(?, folderId)
    WHERE chatId = ?
    ;`,
    [
      update.name,
      update.text,
      update.recentMessageType,
      update.pathToDisplayPic,
      update.readStatus,
      update.authenticated,
      update.timestamp,
      countAction, // Pass countAction for the first newMessageCount CASE parameter
      countAction, // Pass countAction for the second newMessageCount CASE parameter
      update.disconnected,
      update.latestMessageId,
      update.folderId,
      update.chatId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}

/**
 * Updates connection timestamp (generates new if not present) and new message count appropriately
 * @param {ConnectionInfoUpdate} update - The update object containing new values for the connection.
 * @param {countAction} [countAction=NewMessageCountAction.unchanged] The action to perform on the message count.
 */
export async function updateConnectionOnNewMessage(
  update: ConnectionInfoUpdate,
  countAction: NewMessageCountAction = NewMessageCountAction.unchanged,
) {
  await runSimpleQuery(
    `
     UPDATE connections
    SET
    name = COALESCE(?, name),
    text = COALESCE(?, text),
    recentMessageType = COALESCE(?, recentMessageType),
    pathToDisplayPic = COALESCE(?, pathToDisplayPic),
    readStatus = COALESCE(?, readStatus),
    authenticated = COALESCE(?, authenticated),
    timestamp = COALESCE(?, timestamp),
    newMessageCount = CASE
      WHEN ? = 1 THEN newMessageCount + 1
      WHEN ? = 0 THEN 0
      ELSE newMessageCount
    END,
    disconnected = COALESCE(?, disconnected),
    latestMessageId = COALESCE(?, latestMessageId),
    folderId = COALESCE(?, folderId)
    WHERE chatId = ?
    ;`,
    [
      update.name,
      update.text,
      update.recentMessageType,
      update.pathToDisplayPic,
      update.readStatus,
      update.authenticated,
      update.timestamp,
      countAction, // Pass countAction for the first newMessageCount CASE parameter
      countAction, // Pass countAction for the second newMessageCount CASE parameter
      update.disconnected,
      update.latestMessageId,
      update.folderId,
      update.chatId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}
