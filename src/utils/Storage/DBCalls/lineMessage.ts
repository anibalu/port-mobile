import {PAGINATION_LIMIT} from '@configs/constants';
import {runSimpleQuery} from './dbCommon';
import {
  DataType,
  MessageStatus,
  SavedMessageParams,
  UpdateParams,
} from '@utils/Messaging/interfaces';

function toBool(a: number) {
  if (a) {
    return true;
  }
  return false;
}
export async function addMessage(message: SavedMessageParams) {
  await runSimpleQuery(
    `
    INSERT INTO lineMessages (
      messageId,
      chatId,
      contentType,
      data,
      replyId,
      sender,
      memberId,
      timestamp,
      messageStatus,
      expiresOn
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ;
    `,
    [
      message.messageId,
      message.chatId,
      message.contentType,
      JSON.stringify(message.data),
      message.replyId,
      message.sender,
      message.memberId,
      message.timestamp,
      message.messageStatus,
      message.expiresOn,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, res) => {},
  );
}

export async function updateMessage(
  chatId: string,
  messageId: string,
  data: DataType,
) {
  await runSimpleQuery(
    `
    UPDATE lineMessages
    SET data = ?
    WHERE chatId = ? AND messageId = ? ;
    `,
    [JSON.stringify(data), chatId, messageId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, res) => {},
  );
}

/**
 * Get a message
 * @param chatId The chat id of the message you seek
 * @param messageId the message id of the message you seek
 * @returns the message you seek, if it exists
 */
export async function getMessage(
  chatId: string,
  messageId: string,
): Promise<null | SavedMessageParams> {
  let entry = null;
  await runSimpleQuery(
    `
    SELECT * FROM lineMessages
    WHERE chatId = ? and messageId = ? ;
    `,
    [chatId, messageId],
    (tx, results) => {
      if (results.rows.length) {
        entry = results.rows.item(0);
        entry.data = JSON.parse(entry.data);
        entry.sender = toBool(entry.sender);
      }
    },
  );
  return entry;
}

/**
 * Update the status of a message. Do not use for success, only intermediary states
 * or failute.
 * @param chatId the chatId of the message to udpate
 * @param messageId the messageId of the message to update
 * @param readStatus The new read status. Note, if success, use set Sent.
 * @returns null
 */
export async function updateStatus(
  chatId: string,
  messageId: string,
  messageStatus: MessageStatus,
) {
  if (!messageStatus) {
    return;
  }
  await runSimpleQuery(
    `
    UPDATE lineMessages
    SET messageStatus = ?
    WHERE chatId = ? AND messageId = ? ;
    `,
    [messageStatus, chatId, messageId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, res) => {},
  );
}

/**
 * Update the status of a message along with its timestamp. Only used for delivered and read status updates
 * or failute.
 * @param chatId the chatId of the message to udpate
 * @param messageId the messageId of the message to update
 * @param messageStatus The new read status. Note, if success, use set Sent.
 * @param deliveredTimestamp time when the message was delivered.
 * @param readTimestamp time when the message was read
 * @returns null
 */
export async function updateStatusAndTimestamp(
  chatId: string,
  messageId: string,
  updatedParams: UpdateParams,
) {
  await runSimpleQuery(
    `
    UPDATE lineMessages
    SET
    messageStatus = ?,
    deliveredTimestamp = COALESCE(?, deliveredTimestamp),
    readTimestamp = COALESCE(?, readTimestamp),
    shouldAck = COALESCE(?,shouldAck),
    contentType = COALESCE(?,contentType)
    WHERE chatId = ? AND messageId = ? ;
    `,
    [
      updatedParams.updatedMessageStatus
        ? updatedParams.updatedMessageStatus
        : null,
      updatedParams.deliveredAtTimestamp
        ? updatedParams.deliveredAtTimestamp
        : null,
      updatedParams.readAtTimestamp ? updatedParams.readAtTimestamp : null,
      updatedParams.shouldAck ? updatedParams.shouldAck : null,
      updatedParams.updatedContentType
        ? updatedParams.updatedContentType
        : null,
      chatId,
      messageId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, res) => {},
  );
}

/**
 * @param chatId , chat to be loaded
 * @param latestTimestamp , lower bound of messages that need to be fetched
 * @returns {SavedMessageParams[]} list of messages
 * has been directly imported without abstraction
 */
export async function getLatestMessages(
  chatId: string,
  latestTimestamp: string,
): Promise<SavedMessageParams[]> {
  let messageList: SavedMessageParams[] = [];
  await runSimpleQuery(
    `
    SELECT * FROM lineMessages
    WHERE chatId = ? AND timestamp > ?
    ORDER BY timestamp ASC ;
    `,
    [chatId, latestTimestamp],
    (tx, results) => {
      const len = results.rows.length;
      let entry;
      for (let i = 0; i < len; i++) {
        entry = results.rows.item(i);
        entry.data = JSON.parse(entry.data);
        entry.sender = toBool(entry.sender);
        messageList.push(entry);
      }
    },
  );
  return messageList;
}

/**
 * Get the list of messages for a chatId
 * @param chatId the chat id to get messages for
 * @returns the list of chat ids to get messages for
 */
async function getMessageIterator(chatId: string) {
  let messageIterator = {};
  await runSimpleQuery(
    `
    SELECT * FROM lineMessages
    WHERE chatId = ? 
    ORDER BY timestamp ASC ;
    `,
    [chatId],
    (tx, results) => {
      messageIterator = results;
    },
  );
  return messageIterator;
}

//Is reversed, fetches messages from end of list.
export async function getPaginatedMessages(chatId: string, cursor?: number) {
  const iter: any = await getMessageIterator(chatId);
  const len = iter.rows.length;
  let messages = [];

  // Reverse pagination logic
  let startFetchIndex;
  let endFetchIndex;

  if (cursor === undefined) {
    // Fetching the latest messages, up to PAGINATION_LIMIT. This only runs if there is no cursor for the query.
    startFetchIndex = Math.max(0, len - PAGINATION_LIMIT);
    endFetchIndex = len;
  } else if (cursor < PAGINATION_LIMIT) {
    // Not enough messages for a full page, which means we fetch from 0 to cursor.
    startFetchIndex = 0;
    endFetchIndex = cursor;
  } else {
    // Standard reverse pagination, fetching from cursor-X to curson
    startFetchIndex = cursor - PAGINATION_LIMIT;
    endFetchIndex = cursor;
  }

  // Fetch messages, if the cursor isn't 0. Cursor = 0 implies no messages left to fetch
  if (cursor !== 0) {
    for (let i = startFetchIndex; i < endFetchIndex; i++) {
      let entry = iter.rows.item(i);
      entry.data = JSON.parse(entry.data);
      entry.sender = toBool(entry.sender);
      messages.push(entry);
    }
  }

  // Reverse the order to send latest messages first
  messages.reverse();

  // Calculate new cursor position
  const newCursor = Math.max(0, startFetchIndex);

  return {messages: messages, cursor: newCursor, maxLength: len};
}

/**
 * Mark a message as sent. Separate from heloer because it provides a hint
 * to the database to manage indices. Research if definitely needed.
 * @param chatId the chat id of the message to set as sent
 * @param messageId the message id of the message to set as sent
 */
export async function setSent(chatId: string, messageId: string) {
  await runSimpleQuery(
    `
    UPDATE lineMessages
    SET messageStatus = ?
    WHERE chatId = ? AND messageId = ? ;
    `,
    [MessageStatus.sent, chatId, messageId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, res) => {},
  );
}
/**
 * Get ALL unsent messages
 * @returns all messages that haven't been sent
 */
export async function getUnsent(): Promise<SavedMessageParams[]> {
  let unsent: SavedMessageParams[] = [];
  await runSimpleQuery(
    `
    SELECT * FROM lineMessages 
    WHERE messageStatus = ? ;
    `,
    [MessageStatus.journaled],
    (tx, results) => {
      const len = results.rows.length;
      let entry;
      for (let i = 0; i < len; i++) {
        entry = results.rows.item(i);
        entry.data = JSON.parse(entry.data);
        entry.sender = toBool(entry.sender);
        unsent.push(entry);
      }
    },
  );
  return unsent;
}

/**
 * Get a list of all saved messages that have expired
 * @param currentTimestamp The current time in ISOString format
 * @returns a list of all expired messages
 */
export async function getExpiredMessages(
  currentTimestamp: string,
): Promise<SavedMessageParams[]> {
  let expired: SavedMessageParams[] = [];
  await runSimpleQuery(
    `
    SELECT * FROM lineMessages 
    WHERE expiresOn < ? ;
    `,
    [currentTimestamp],
    (tx, results) => {
      const len = results.rows.length;
      let entry;
      for (let i = 0; i < len; i++) {
        entry = results.rows.item(i);
        entry.data = JSON.parse(entry.data);
        entry.sender = toBool(entry.sender);
        expired.push(entry);
      }
    },
  );
  return expired;
}

/**
 * Delete a message permanently.
 * Not intended for use with deleting a regular message.
 * Intended for use with disappearing messages.
 * @param chatId 32 char id
 * @param messageId 32 char id
 */
export async function permanentlyDeleteMessage(
  chatId: string,
  messageId: string,
) {
  await runSimpleQuery(
    `
    DELETE FROM lineMessages 
    WHERE chatId = ? AND messageId = ? ;
    `,
    [chatId, messageId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}
