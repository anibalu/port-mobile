import {runSimpleQuery} from './dbCommon';

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
export async function getMessages(chatId: string) {
  let messageList = [];
  await runSimpleQuery(
    `
    SELECT * FROM lineMessages
    WHERE chatId = ? 
    ORDER BY timestamp ASC;
    `,
    [chatId],
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
