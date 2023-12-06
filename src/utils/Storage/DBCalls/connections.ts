import {runSimpleQuery} from './dbCommon';

export type ConnectionEntry = {
  chatId: string;
  connectionType: number;
  name: string;
  permissions: object;
  text?: string;
  recentMessageType?: number;
  pathToDisplayPic?: string;
  readStatus?: number;
  authenticated?: boolean;
  timestamp?: string;
  newMessageCount?: number;
  disconnected?: boolean;
};

/**
 * Get all of the user's connections
 * @returns All current connections
 */
export async function getConnections() {
  const connections = [];
  await runSimpleQuery(
    `SELECT * FROM connections
    ORDER BY timestamp DESC;`,
    [],
    (tx, results) => {
      const len = results.rows.length;
      let entry;
      for (let i = 0; i < len; i++) {
        entry = results.rows.item(i);
        entry.permissions = JSON.parse(entry.permissions);
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
): Promise<ConnectionEntry | null> {
  let connection: ConnectionEntry | null = null;
  await runSimpleQuery(
    `
    SELECT * FROM connections
    WHERE chatId = ?;
    `,
    [chatId],

    (tx, results) => {
      try {
        const con = results.rows.item(0);
        con.permissions = JSON.parse(con.permissions);
        connection = con;
      } catch {
        connection = null;
      }
    },
  );
  return connection;
}

/**
 * Add a new connection for a user
 * @param connection The connection to add
 */
export async function addConnection(connection: ConnectionEntry) {
  await runSimpleQuery(
    `
    INSERT INTO connections (
      chatId,
      connectionType,
      name,
      permissions,
      text,
      recentMessageType,
      pathToDisplayPic,
      readStatus,
      authenticated,
      timestamp,
      newMessageCount,
      disconnected
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);`,
    [
      connection.chatId,
      connection.connectionType,
      connection.name,
      JSON.stringify(connection.permissions),
      connection.text,
      connection.recentMessageType,
      connection.pathToDisplayPic,
      connection.readStatus,
      connection.authenticated,
      connection.timestamp,
      connection.newMessageCount,
      connection.disconnected,
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

export type ConnectionUpdate = {
  name?: string;
  permissions?: object;
  text?: string;
  recentMessageType?: number;
  pathToDisplayPic?: string;
  readStatus?: number;
  authenticated?: boolean;
  timestamp?: string;
  newMessageCount?: number;
  disconnected?: boolean;
};

export async function updateConnection(
  chatId: string,
  update: ConnectionUpdate,
) {
  const connection: ConnectionEntry | null = await getConnection(chatId);
  if (!connection) {
    return;
  }

  await runSimpleQuery(
    `
    UPDATE connections
    SET
    name = COALESCE(?, name),
    permissions = COALESCE(?, permissions),
    text = COALESCE(?, text),
    recentMessageType = COALESCE(?, recentMessageType),
    pathToDisplayPic = COALESCE(?, pathToDisplayPic),
    readStatus = COALESCE(?, readStatus),
    authenticated = COALESCE(?, authenticated),
    timestamp = COALESCE(?, timestamp),
    newMessageCount = COALESCE(?, newMessageCount),
    disconnected = COALESCE(?, disconnected)
    WHERE chatId = ?
    ;`,
    [
      update.name,
      JSON.stringify(update.permissions),
      update.text,
      update.recentMessageType,
      update.pathToDisplayPic,
      update.readStatus,
      update.authenticated,
      update.timestamp,
      update.newMessageCount,
      update.disconnected,
      chatId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}
