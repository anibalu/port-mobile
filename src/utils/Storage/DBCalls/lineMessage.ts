import {PAGINATION_LIMIT} from '@configs/constants';
import {runSimpleQuery} from './dbCommon';
import {SavedMessageParams} from '@utils/Messaging/interfaces';

function toBool(a: number) {
  if (a) {
    return true;
  }
  return false;
}

export type MessageEntry = {
  messageId: string;
  chatId: string;
  contentType: number;
  data: object;
  replyId: string;
  sender: boolean;
  memberId: string;
  sendStatus: number;
  timestamp: string;
};

export async function addMessage(message: MessageEntry) {
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
      sendStatus
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
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
      message.sendStatus,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, res) => {},
  );
}

export async function updateMessage(
  chatId: string,
  messageId: string,
  data: object,
) {
  await runSimpleQuery(
    `
    UPDATE lineMessages
    SET data = ?
    WHERE chatId = ? AND messageId = ?
    ;
    `,
    [JSON.stringify(data), chatId, messageId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, res) => {},
  );
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
  readStatus: number,
) {
  if (!readStatus) {
    return;
  }
  await runSimpleQuery(
    `
    UPDATE lineMessages
    SET sendStatus = ?
    WHERE chatId = ? AND messageId = ?
    ;
    `,
    [readStatus, chatId, messageId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, res) => {},
  );
}

/**
 * Get the list of messages for a chatId
 * @param chatId the chat id to get messages for
 * @returns the list of chat ids to get messages for
 */
export async function getMessageIterator(chatId: string) {
  let messageIterator = {};
  await runSimpleQuery(
    `
    SELECT * FROM lineMessages
    WHERE chatId = ? 
    ORDER BY timestamp ASC;
    `,
    [chatId],
    (tx, results) => {
      messageIterator = results;
    },
  );
  return messageIterator;
}

/**
 * @param chatId , chat to be loaded
 * @param latestTimestamp , lower bound of messages that need to be fetched
 * @returns {SavedMessageParams[]} list of messages
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
    ORDER BY timestamp ASC;
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
 * Get a message
 * @param chatId The chat id of the message you seek
 * @param messageId the message id of the message you seek
 * @returns the message you seek, if it exists
 */
export async function getMessage(chatId: string, messageId: string) {
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
 * Mark a message as sent. Separate from heloer because it provides a hint
 * to the database to manage indices. Research if definitely needed.
 * @param chatId the chat id of the message to set as sent
 * @param messageId the message id of the message to set as sent
 */
export async function setSent(chatId: string, messageId: string) {
  await runSimpleQuery(
    `
    UPDATE lineMessages
    SET sendStatus = 0
    WHERE chatId = ? AND messageId = ?
    ;
    `,
    [chatId, messageId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, res) => {},
  );
}
/**
 * Get ALL unsent messages
 * @returns all messages that haven't been sent
 */
export async function getUnsent() {
  let unsent = [];
  await runSimpleQuery(
    `
    SELECT * FROM lineMessages 
    WHERE sendStatus = 2;
    `,
    [],
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
