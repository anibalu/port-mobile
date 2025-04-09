import {ContentType, MessageStatus} from '@utils/Messaging/interfaces';

import {runSimpleQuery, toBool, toNumber} from './dbCommon';

export enum ChatType {
  direct = 0,
  group = 1,
}

// Enum to define actions that can be performed on the new message count
export enum NewMessageCountAction {
  // Reset the new message count to 0
  reset = 0,
  // Increment the new message count by 1
  increment = 1,
  // Leave the new message count unchanged
  unchanged = 2,
}

export interface ConnectionUpdate {
  chatId: string;
  connectionType?: ChatType;
  text?: string | null;
  recentMessageType?: ContentType;
  readStatus?: MessageStatus | null;
  timestamp?: string | null;
  newMessageCount?: number;
  latestMessageId?: string | null;
  folderId?: string;
  pairHash?: string;
  routingId?: string;
}

export interface ConnectionEntry extends ConnectionUpdate {
  connectionType: ChatType;
  recentMessageType: ContentType;
  readStatus: MessageStatus;
  timestamp: string;
  newMessageCount: number;
  folderId: string;
  routingId: string;
}

/**
 * We need to join and load up additional attributes.
 */
export interface ConnectionInfo extends ConnectionEntry {
  name: string;
  pathToDisplayPic?: string | null;
  authenticated: boolean;
  disconnected: boolean;
  permissionsId: string;
  folderName: string;
}

/**
 * Get a connection with all attached attributes if it exists
 * @param chatId The id of the chat to get
 * @returns If found, the connection queried
 */
export async function loadConnection(
  chatId: string,
): Promise<ConnectionInfo | null> {
  let connection: ConnectionInfo | null = null;
  await runSimpleQuery(
    `SELECT 
      connection.chatId as chatId,
      connection.connectionType as connectionType,
      connection.text as text,
      connection.recentMessageType as recentMessageType,
      connection.readStatus as readStatus,
      connection.timestamp as timestamp,
      connection.newMessageCount as newMessageCount,
      connection.latestMessageId as latestMessageId,
      connection.folderId as folderId,
      connection.pairHash as pairHash,
      connection.routingId as routingId,
      lines.authenticated as authenticated,
      COALESCE(lines.disconnected, groups.disconnected) as disconnected,
      lines.permissionsId as permissionsId,
      COALESCE(contacts.name, groups.name) as name,
      COALESCE(contacts.displayPic, groups.groupPicture) as pathToDisplayPic,
      folder.name as folderName
    FROM 
      (SELECT * FROM connections WHERE chatId = ?) connection
      LEFT JOIN
      lines
      ON connection.routingId = lines.lineId
      LEFT JOIN
      groups
      ON connection.routingId = groups.groupId
      LEFT JOIN
      contacts
      ON connection.pairHash = contacts.pairHash
      LEFT JOIN
      folders folder
      ON connection.folderId = folder.folderId
      ;`,
    [chatId],

    (tx, results) => {
      const len = results.rows.length;
      if (len > 0) {
        const entry = results.rows.item(0);
        entry.authenticated = toBool(entry.authenticated);
        entry.disconnected = toBool(entry.disconnected);
        connection = entry;
      }
    },
  );
  return connection;
}

/**
 * Get all of the user's connections with all attached attributes
 * @returns All current connections
 */
export async function loadConnections(): Promise<ConnectionInfo[]> {
  const connections: ConnectionInfo[] = [];
  await runSimpleQuery(
    `SELECT 
      connection.chatId as chatId,
      connection.connectionType as connectionType,
      connection.text as text,
      connection.recentMessageType as recentMessageType,
      connection.readStatus as readStatus,
      connection.timestamp as timestamp,
      connection.newMessageCount as newMessageCount,
      connection.latestMessageId as latestMessageId,
      connection.folderId as folderId,
      connection.pairHash as pairHash,
      connection.routingId as routingId,
      lines.authenticated as authenticated,
      COALESCE(lines.disconnected, groups.disconnected) as disconnected,
      lines.permissionsId as permissionsId,
      COALESCE(contacts.name, groups.name) as name,
      COALESCE(contacts.displayPic, groups.groupPicture) as pathToDisplayPic,
      folder.name as folderName
    FROM 
      connections connection
      LEFT JOIN
      lines
      ON connection.routingId = lines.lineId
      LEFT JOIN
      groups
      ON connection.routingId = groups.groupId
      LEFT JOIN
      contacts
      ON connection.pairHash = contacts.pairHash
      LEFT JOIN
      folders folder
      ON connection.folderId = folder.folderId
      ORDER BY connection.timestamp DESC
      ;`,
    [],
    (tx, results) => {
      const len = results.rows.length;
      for (let i = 0; i < len; i++) {
        const entry = results.rows.item(i);
        entry.authenticated = toBool(entry.authenticated);
        entry.disconnected = toBool(entry.disconnected);
        connections.push(entry);
      }
    },
  );
  return connections;
}

/**
 * Gets a count of all connections
 * @returns count of all connections
 */
export async function countOfConnections(): Promise<number> {
  let count = 0;
  await runSimpleQuery(
    `SELECT COUNT(*) as count
      FROM connections
      ;`,
    [],
    (tx, results) => {
      count = results.rows.item(0).count;
    },
  );
  return count;
}
/**
 * Get a connection with all attached attributes if it exists
 * @param chatId The id of the chat to get
 * @returns If found, the connection queried
 */
export async function loadConnectionsInFolder(
  folderId: string,
): Promise<ConnectionInfo[]> {
  const connections: ConnectionInfo[] = [];
  await runSimpleQuery(
    `SELECT 
      connection.chatId as chatId,
      connection.connectionType as connectionType,
      connection.text as text,
      connection.recentMessageType as recentMessageType,
      connection.readStatus as readStatus,
      connection.timestamp as timestamp,
      connection.newMessageCount as newMessageCount,
      connection.latestMessageId as latestMessageId,
      connection.folderId as folderId,
      connection.pairHash as pairHash,
      connection.routingId as routingId,
      lines.authenticated as authenticated,
      COALESCE(lines.disconnected, groups.disconnected) as disconnected,
      lines.permissionsId as permissionsId,
      COALESCE(contacts.name, groups.name) as name,
      COALESCE(contacts.displayPic, groups.groupPicture) as pathToDisplayPic,
      folder.name as folderName
    FROM 
      (SELECT * FROM connections WHERE folderId = ?) connection
      LEFT JOIN
      lines
      ON connection.routingId = lines.lineId
      LEFT JOIN
      groups
      ON groups.groupId = connection.routingId
      LEFT JOIN
      contacts
      ON connection.pairHash = contacts.pairHash
      LEFT JOIN
      folders folder
      ON connection.folderId = folder.folderId
      ORDER BY connection.timestamp DESC
      ;`,
    [folderId],
    (tx, results) => {
      const len = results.rows.length;
      for (let i = 0; i < len; i++) {
        const entry = results.rows.item(i);
        entry.authenticated = toBool(entry.authenticated);
        entry.disconnected = toBool(entry.disconnected);
        connections.push(entry);
      }
    },
  );
  return connections;
}

export async function loadLimitedConnectionsInFolder(
  folderId: string,
  LIMIT: number = 4,
): Promise<ConnectionInfo[]> {
  const connections: ConnectionInfo[] = [];
  await runSimpleQuery(
    `SELECT 
      connection.chatId as chatId,
      connection.connectionType as connectionType,
      connection.text as text,
      connection.recentMessageType as recentMessageType,
      connection.readStatus as readStatus,
      connection.timestamp as timestamp,
      connection.newMessageCount as newMessageCount,
      connection.latestMessageId as latestMessageId,
      connection.folderId as folderId,
      connection.pairHash as pairHash,
      connection.routingId as routingId,
      lines.authenticated as authenticated,
      lines.disconnected as disconnected,
      lines.permissionsId as permissionsId,
      contacts.name as name,
      contacts.displayPic as pathToDisplayPic,
      folder.name as folderName
    FROM 
      (SELECT * FROM connections WHERE folderId = ?) connection
      LEFT JOIN
      lines
      ON connection.routingId = lines.lineId
      LEFT JOIN
      contacts
      ON connection.pairHash = contacts.pairHash
      LEFT JOIN
      folders folder
      ON connection.folderId = folder.folderId
      ORDER BY connection.timestamp DESC
      LIMIT ?
      ;`,
    [folderId, LIMIT],
    (tx, results) => {
      const len = results.rows.length;
      for (let i = 0; i < len; i++) {
        const entry = results.rows.item(i);
        entry.authenticated = toBool(entry.authenticated);
        entry.disconnected = toBool(entry.disconnected);
        connections.push(entry);
      }
    },
  );
  return connections;
}

/**
 * This util returns all chats which has focus permission as true
 * @returns chats with focus permission turned on
 */
export async function loadConnectionsInFocus() {
  const connections: ConnectionInfo[] = [];
  await runSimpleQuery(
    `SELECT 
      connection.chatId as chatId,
      connection.connectionType as connectionType,
      connection.text as text,
      connection.recentMessageType as recentMessageType,
      connection.readStatus as readStatus,
      connection.timestamp as timestamp,
      connection.newMessageCount as newMessageCount,
      connection.latestMessageId as latestMessageId,
      connection.folderId as folderId,
      connection.pairHash as pairHash,
      connection.routingId as routingId,
      lines.authenticated as authenticated,
      COALESCE(lines.disconnected, groups.disconnected) as disconnected,
      lines.permissionsId as permissionsId,
      COALESCE(contacts.name, groups.name) as name,
      COALESCE(contacts.displayPic, groups.groupPicture) as pathToDisplayPic,
      folder.name as folderName
    FROM 
      connections connection
    LEFT JOIN
      lines
      ON connection.routingId = lines.lineId
    LEFT JOIN
      groups
      ON connection.routingId = groups.groupId
    LEFT JOIN
      contacts
      ON connection.pairHash = contacts.pairHash
    LEFT JOIN
      folders folder
      ON connection.folderId = folder.folderId
    LEFT JOIN permissions ON COALESCE(lines.permissionsId, groups.permissionsId) = permissions.permissionsId
    WHERE permissions.focus = true
    ORDER BY connection.timestamp DESC
    ;`,
    [],
    (tx, results) => {
      const len = results.rows.length;
      for (let i = 0; i < len; i++) {
        const entry = results.rows.item(i);
        entry.authenticated = toBool(entry.authenticated);
        entry.disconnected = toBool(entry.disconnected);
        connections.push(entry);
      }
    },
  );
  return connections;
}

/**
 * Get basic connection attributes
 * @param chatId - chat Id of the connection
 * @returns - connection
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
      const len = results.rows.length;
      if (len > 0) {
        connection = results.rows.item(0);
      }
    },
  );
  return connection;
}

/**
 * Get chatId associated with a routing
 * @param routingId - routing Id of the line
 * @returns - chatId if exists
 */
export async function getChatIdFromRoutingId(
  routingId: string,
): Promise<string | null> {
  let chatId: string | null = null;
  await runSimpleQuery(
    `
    SELECT * FROM connections
    WHERE routingId = ?
    LIMIT 1;
    `,
    [routingId],
    (tx, results) => {
      const len = results.rows.length;
      if (len > 0) {
        const connection = results.rows.item(0);
        if (connection?.chatId) {
          chatId = connection.chatId;
        }
      }
    },
  );
  return chatId;
}

/**
 * Get chatId associated with a pairHash
 * @param pairHash
 * @returns - chatId if exists
 */
export async function getChatIdFromPairHash(
  pairHash: string,
): Promise<string | null> {
  let chatId: string | null = null;
  await runSimpleQuery(
    `
    SELECT * FROM connections
    WHERE pairHash = ?
    LIMIT 1;
    `,
    [pairHash],
    (tx, results) => {
      const len = results.rows.length;
      if (len > 0) {
        const connection = results.rows.item(0);
        if (connection?.chatId) {
          chatId = connection.chatId;
        }
      }
    },
  );
  return chatId;
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
      text,
      recentMessageType,
      readStatus,
      timestamp,
      newMessageCount,
      latestMessageId,
      folderId,
      pairHash,
      routingId
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?);`,
    [
      connection.chatId,
      connection.connectionType,
      connection.text,
      connection.recentMessageType,
      connection.readStatus,
      connection.timestamp,
      connection.newMessageCount,
      connection.latestMessageId,
      connection.folderId,
      connection.pairHash,
      connection.routingId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}

/**
 * Get new message count for a particular folder or for all connections
 * @param folderId - optional folderId
 * @returns - new message count
 */
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
 * @todo - add guards to prevent deletion if line still exists
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
 * @param {ConnectionUpdate} update - The update object containing new values for the connection.
 * @param {countAction} [countAction=NewMessageCountAction.unchanged] The action to perform on the message count.
 */
export async function updateConnection(
  update: ConnectionUpdate,
  countAction: NewMessageCountAction = NewMessageCountAction.unchanged,
) {
  await runSimpleQuery(
    `
     UPDATE connections
    SET
    text = COALESCE(?, text),
    recentMessageType = COALESCE(?, recentMessageType),
    readStatus = COALESCE(?, readStatus),
    timestamp = COALESCE(?, timestamp),
    newMessageCount = CASE
      WHEN ? = 1 THEN newMessageCount + 1
      WHEN ? = 0 THEN 0
      ELSE newMessageCount
    END,
    latestMessageId = COALESCE(?, latestMessageId),
    folderId = COALESCE(?, folderId),
    routingId = COALESCE(?, routingId)
    WHERE chatId = ?
    ;`,
    [
      update.text,
      update.recentMessageType,
      update.readStatus,
      update.timestamp,
      countAction, // Pass countAction for the first newMessageCount CASE parameter
      countAction, // Pass countAction for the second newMessageCount CASE parameter
      update.latestMessageId,
      update.folderId,
      update.routingId,
      update.chatId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}

/**
 * This util gets a count of chats in any folder
 * @param folderId folder id required
 * @returns a count of chats
 */
export async function getCountOfChatsInAFolder(
  folderId: string,
): Promise<number> {
  let count = 0;
  await runSimpleQuery(
    `
    SELECT COUNT(*) as count
      FROM connections
      WHERE connections.folderId = ?;
    `,
    [folderId],
    (tx, results) => {
      count = results.rows.item(0).count;
    },
  );
  return count;
}
