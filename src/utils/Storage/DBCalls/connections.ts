import {runSimpleQuery} from './dbCommon';
import {
  ConnectionInfo,
  ConnectionInfoUpdate,
} from '@utils/Connections/interfaces';

function toBool(a: number | boolean | null | undefined): boolean {
  if (a) {
    return true;
  } else {
    return false;
  }
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
      latestMessageId
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);`,
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
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
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

export async function updateConnection(update: ConnectionInfoUpdate) {
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
    newMessageCount = COALESCE(?, newMessageCount),
    disconnected = COALESCE(?, disconnected),
    latestMessageId = COALESCE(?, latestMessageId)
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
      update.newMessageCount,
      update.disconnected,
      update.latestMessageId,
      update.chatId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}
