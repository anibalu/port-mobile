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

export async function setSent(chatId: string, messageId: string) {
  console.log('setting sent: ', messageId);
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
