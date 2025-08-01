import {ContentType, MessageStatus} from '@utils/Messaging/interfaces';
import {generateISOTimeStamp} from '@utils/Time';

import {runSimpleQuery, toBool} from './dbCommon';

export interface updateMessageParams {
  contentType?: ContentType | null; // What type of message the content is
  data?: any; // The content itself
  replyId?: string | null; // The id of the message this was sent as a reply to
  timestamp?: string | null; // When the message was sent/received
  messageStatus?: MessageStatus | null; // What state is the message in eg: read/unsent
  deliveredTimestamp?: string | null; // When was this message delivered to the peer
  readTimestamp?: string | null; // When was this message read by the peer
  shouldAck?: boolean | null; // Should a read receipt be sent when this message is rendered
  hasReaction?: boolean | null; // Does this message have reactions
  expiresOn?: string | null; // When does this message need to disappear after
  mediaId?: string | null; // ID of potentially associated media
}

export interface LineMessageData extends updateMessageParams {
  messageId: string;
  chatId: string; // What chat does this message belong to
  sender: boolean; // Whether the message was sent by this device
  mtime?: string | null; // When was this message last modified
  contentType: ContentType;
  data: any;
}

export interface ReplyContent {
  contentType: ContentType | null;
  data: any | null;
  sender: boolean | null;
  chatId: string | null;
}

export interface LoadedMessage {
  chatId: string;
  messageId: string;
  contentType: ContentType;
  data: any;
  timestamp: string;
  sender: boolean;
  messageStatus: MessageStatus;
  expiresOn: string | null;
  shouldAck: boolean | null;
  hasReaction: boolean | null;
  readTimestamp: string | null;
  deliveredTimestamp: string | null;
  mtime: string | null;
  reply: ReplyContent;
  mediaId: string | null;
  filePath: string | null;
}

/**
 * Save a new message
 * @param message The message to save
 */
export async function addMessage(message: LineMessageData) {
  await runSimpleQuery(
    `
    INSERT INTO lineMessages (
      messageId,
      chatId,
      contentType,
      data,
      replyId,
      sender,
      timestamp,
      messageStatus,
      expiresOn,
      mtime,
      shouldAck,
      mediaId
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ;
    `,
    [
      message.messageId,
      message.chatId,
      message.contentType,
      JSON.stringify(message.data),
      message.replyId,
      message.sender,
      message.timestamp,
      message.messageStatus,
      message.expiresOn,
      generateISOTimeStamp(),
      message.shouldAck,
      message.mediaId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, res) => {},
  );
}

/**
 * Get a message
 * @param chatId The chat id of the message you seek
 * @param messageId the message id of the message you seek
 * @returns the message you seek, if it exists, null otherwise
 */
export async function getMessage(
  chatId: string,
  messageId: string,
): Promise<LineMessageData | null> {
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
        entry.hasReaction = toBool(entry.hasReaction);
        entry.shouldAck = toBool(entry.shouldAck);
      }
    },
  );
  return entry;
}

/**
 * Get the most recent message of a specific content type in a chat
 * @param chatId The chat id to search in
 * @param contentType The content type to search for
 * @returns The most recent message matching the content type, or null if none exists
 */
export async function getLastMessageOfType(
  chatId: string,
  contentType: ContentType,
): Promise<LineMessageData | null> {
  let entry = null;
  await runSimpleQuery(
    `
    SELECT * FROM lineMessages 
    WHERE chatId = ? AND contentType = ?
    ORDER BY timestamp DESC
    LIMIT 1;
    `,
    [chatId, contentType],
    (tx, results) => {
      if (results.rows.length) {
        entry = results.rows.item(0);
        entry.data = JSON.parse(entry.data);
        entry.sender = toBool(entry.sender);
        entry.hasReaction = toBool(entry.hasReaction);
        entry.shouldAck = toBool(entry.shouldAck);
      }
    },
  );
  return entry;
}

/**
 * Get the latest messages in a chat
 * @param chatId
 * @param limit The maximum number of latest messages to return
 * @returns Up to the <limit> latest messages in <chatId>
 */
export async function getLatestMessages(
  chatId: string,
  limit: number = 50,
): Promise<LoadedMessage[]> {
  const messageList: LoadedMessage[] = [];
  /**
   * We begin by getting the first <limit> most recent messages and alias
   * that to the table messages.
   * Next we left join that with the lineMessages table aliased to reply.
   * With this, messages that have a reply have been joined to their reply.
   * With this, messages that have media have media params joined.
   * We finally project this onto the fields that we want, renaming columns as needed.
   */
  /**
   * In the future, we should explore performing the limit and the sorting AFTER
   * the join to see if the query optimizer picks up on that.
   */
  await runSimpleQuery(
    `
    SELECT
      message.chatId as chatId,
      message.messageId as messageId,
      message.contentType as contentType,
      message.data as data,
      message.timestamp as timestamp,
      message.sender as sender,
      message.messageStatus as messageStatus,
      message.expiresOn as expiresOn,
      message.shouldAck as shouldAck,
      message.hasReaction as hasReaction,
      message.readTimestamp as readTimestamp,
      message.deliveredTimestamp as deliveredTimestamp,
      message.mtime as mtime,
      message.mediaId as mediaId,
      media.filePath as filePath,
      reply.contentType as reply_contentType,
      reply.data as reply_data,
      reply.sender as reply_sender,
      reply.chatId as reply_chatId
    FROM
      (SELECT * FROM lineMessages
      WHERE chatId = ?
      ORDER BY timestamp DESC
      LIMIT ?) message
      LEFT JOIN 
      lineMessages reply
      ON message.replyId = reply.messageId
      LEFT JOIN
      media
      ON message.mediaId = media.mediaId
    ;
    `,
    [chatId, limit],
    (tx, results) => {
      const len = results.rows.length;
      let entry;
      for (let i = 0; i < len; i++) {
        entry = results.rows.item(i);
        // We convert some columns into correct destination types
        entry.data = JSON.parse(entry.data);
        entry.sender = toBool(entry.sender);
        entry.shouldAck = toBool(entry.shouldAck);
        entry.hasReaction = toBool(entry.hasReaction);
        // We convert the reply columns into a more typescript friendly format
        entry.reply = {};
        entry.reply.contentType = entry.reply_contentType;
        entry.reply.data = JSON.parse(entry.reply_data);
        entry.reply.sender = toBool(entry.reply_sender);
        entry.reply.chatId = entry.reply_chatId;
        messageList.push(entry);
      }
    },
  );
  return messageList;
}

/**
 * Update an existing message
 * @param chatId A chat
 * @param messageId  A message in the given chat
 * @param updateParams The parameters to change
 */
export async function updateSavedMessage(
  chatId: string,
  messageId: string,
  updateParams: updateMessageParams,
) {
  await runSimpleQuery(
    /**
     * You may notice that some coalesces are backwards from the rest.
     * This is because some columns cannot be updated from non-null values.
     */
    `
    UPDATE lineMessages SET
      contentType = COALESCE(?, contentType),
      data = COALESCE(?, data),
      replyId = COALESCE(?, replyId),
      timestamp = COALESCE(?, timestamp),
      messageStatus = COALESCE(?, messageStatus),
      deliveredTimestamp = COALESCE(deliveredTimestamp, ?),
      readTimestamp = COALESCE(readTimestamp, ?),
      shouldAck = COALESCE(?, shouldAck),
      hasReaction = COALESCE(?, hasReaction),
      expiresOn = COALESCE(?, expiresOn),
      mediaId = COALESCE(?, mediaId),
      mtime = COALESCE(?, mtime)
    WHERE chatId = ? AND messageId = ? ;
    `,
    [
      updateParams.contentType,
      JSON.stringify(updateParams.data),
      updateParams.replyId,
      updateParams.timestamp,
      updateParams.messageStatus,
      updateParams.deliveredTimestamp,
      updateParams.readTimestamp,
      updateParams.shouldAck,
      updateParams.hasReaction,
      updateParams.expiresOn,
      updateParams.mediaId,
      generateISOTimeStamp(),
      chatId,
      messageId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, res) => {},
  );
}

/**
 * Retrieves all the messageIds associated with a given chatId.
 * @param chatId string: The ID of the chat to retrieve messages for.
 * @returns {<string[]>} array of message ids
 */
export async function getAllMessagesIdsInChat(
  chatId: string,
): Promise<string[]> {
  const messages: string[] = [];
  await runSimpleQuery(
    `
    SELECT messageId FROM lineMessages
    WHERE chatId = ?
    `,
    [chatId],
    (tx, results) => {
      for (let i = 0; i < results.rows.length; i++) {
        const entry = results.rows.item(i).messageId;
        messages.push(entry);
      }
    },
  );
  return messages;
}

/**
 * Delete a message permanently.
 * Not intended for use with deleting a regular message.
 * Intended for use with disappearing messages.
 * @param chatId chat Id of the chat.
 * @param messageId message Id of the message to be deleted.
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

/**
 * Get ALL unsent messages
 * @returns all messages that haven't been sent
 */
export async function getUnsent(): Promise<LineMessageData[]> {
  const unsent: LineMessageData[] = [];
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
        entry.shouldAck = toBool(entry.shouldAck);
        entry.hasReaction = toBool(entry.hasReaction);
        unsent.push(entry);
      }
    },
  );
  return unsent;
}

/**
 * delete ALL unsent messages
 */
export async function deleteUnsent() {
  await runSimpleQuery(
    `
    DELETE FROM lineMessages 
    WHERE messageStatus = ? ;
    `,
    [MessageStatus.journaled],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Get a list of all saved messages that have expired
 * @param currentTimestamp The current time in ISOString format
 * @returns a list of all expired messages
 */
export async function getExpiredMessages(
  currentTimestamp: string,
): Promise<LineMessageData[]> {
  const expired: LineMessageData[] = [];
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
        entry.shouldAck = toBool(entry.shouldAck);
        entry.hasReaction = toBool(entry.hasReaction);
        expired.push(entry);
      }
    },
  );
  return expired;
}
