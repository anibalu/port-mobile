import {runSimpleQuery, toBool} from './dbCommon';
import {ContentType, MessageStatus} from '@utils/Messaging/interfaces';
import {generateISOTimeStamp} from '@utils/Time';

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
  messageId: string | null;
  timestamp: string | null;
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
  isHighlighted?: boolean | null;
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
 * Get the latest messages in a chat, including the timestamp of any reply
 * @param chatId
 * @param limit The maximum number of latest messages to return
 * @returns Up to the <limit> latest messages in <chatId>
 */
export async function getLatestMessages(
  chatId: string,
  limit: number = 50,
): Promise<LoadedMessage[]> {
  let messageList: LoadedMessage[] = [];

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
      reply.messageId as reply_messageId,
      reply.timestamp as reply_timestamp
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
        // Convert some columns into correct destination types
        entry.data = JSON.parse(entry.data);
        entry.sender = toBool(entry.sender);
        entry.shouldAck = toBool(entry.shouldAck);
        entry.hasReaction = toBool(entry.hasReaction);
        entry.reply = {
          contentType: entry.reply_contentType,
          data: JSON.parse(entry.reply_data),
          sender: toBool(entry.reply_sender),
          messageId: entry.reply_messageId,
          timestamp: entry.reply_timestamp,
        };

        // Push the processed entry to the message list
        messageList.push(entry);
      }
    },
  );

  return messageList;
}

/**
 * Get 25 messages around (before and after) a specific timestamp in a chat and UNION them.
 * Add an `isHighlighted` attribute to the target message.
 * @param chatId
 * @param timestamp The ISO string timestamp of the item we want to load around
 * @returns An array of LoadedMessages around the specified <timestamp> (51 total including target message)
 */
export async function getMessagesAroundTimestamp(
  chatId: string,
  timestamp: string,
): Promise<LoadedMessage[]> {
  let messageList: LoadedMessage[] = [];

  await runSimpleQuery(
    `
    SELECT * FROM (
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
      reply.chatId as reply_chatId,
      reply.messageId as reply_messageId,
      reply.timestamp as reply_timestamp,
      CASE WHEN message.timestamp = ? THEN 1 ELSE 0 END as isHighlighted
    FROM
      lineMessages message
    LEFT JOIN 
      lineMessages reply
      ON message.replyId = reply.messageId
    LEFT JOIN
      media
      ON message.mediaId = media.mediaId
    WHERE message.chatId = ?
    AND message.timestamp > ?
    ORDER BY message.timestamp ASC
    LIMIT 25
    ) 
    UNION ALL
    SELECT * FROM (
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
      reply.chatId as reply_chatId,
      reply.messageId as reply_messageId,
      reply.timestamp as reply_timestamp,
      CASE WHEN message.timestamp = ? THEN 1 ELSE 0 END as isHighlighted
    FROM
      lineMessages message
    LEFT JOIN 
      lineMessages reply
      ON message.replyId = reply.messageId
    LEFT JOIN
      media
      ON message.mediaId = media.mediaId
    WHERE message.chatId = ?
    AND message.timestamp <= ?
    ORDER BY message.timestamp DESC
    LIMIT 25
    )
    ORDER BY timestamp DESC
    `,
    [timestamp, chatId, timestamp, timestamp, chatId, timestamp],
    (tx, results) => {
      const len = results.rows.length;
      let entry;
      for (let i = 0; i < len; i++) {
        entry = results.rows.item(i);
        entry.data = JSON.parse(entry.data);
        entry.sender = toBool(entry.sender);
        entry.shouldAck = toBool(entry.shouldAck);
        entry.hasReaction = toBool(entry.hasReaction);
        entry.reply = {
          contentType: entry.reply_contentType,
          data: JSON.parse(entry.reply_data),
          sender: toBool(entry.reply_sender),
          chatId: entry.reply_chatId,
          messageId: entry.reply_messageId,
          timestamp: entry.reply_timestamp,
        };

        messageList.push(entry);
      }
    },
  );

  return messageList;
}

/**
 * Fetch messages after the given messageId with a specified limit
 * @param chatId The chat to search in
 * @param messageId The messageId to search after
 * @param limit The number of messages to fetch (default 25)
 * @returns An array of LoadedMessages fetched after the given messageId
 */
export async function getMessagesAfterMessageId(
  chatId: string,
  messageId: string,
  limit: number = 25,
): Promise<LoadedMessage[]> {
  let messageList: LoadedMessage[] = [];

  await runSimpleQuery(
    `
    SELECT * FROM (
      SELECT
          message.chatId AS chatId,
          message.messageId AS messageId,
          message.contentType AS contentType,
          message.data AS data,
          message.timestamp AS timestamp,
          message.sender AS sender,
          message.messageStatus AS messageStatus,
          message.expiresOn AS expiresOn,
          message.shouldAck AS shouldAck,
          message.hasReaction AS hasReaction,
          message.readTimestamp AS readTimestamp,
          message.deliveredTimestamp AS deliveredTimestamp,
          message.mtime AS mtime,
          message.mediaId AS mediaId,
          media.filePath AS filePath,
          reply.contentType AS reply_contentType,
          reply.data AS reply_data,
          reply.sender AS reply_sender,
          reply.chatId AS reply_chatId,
          reply.messageId AS reply_messageId,
          reply.timestamp AS reply_timestamp
      FROM lineMessages message
      LEFT JOIN lineMessages reply ON message.replyId = reply.messageId
      LEFT JOIN media ON message.mediaId = media.mediaId
      WHERE message.chatId = ?
        AND message.timestamp >= (
            SELECT timestamp
            FROM lineMessages
            WHERE messageId = ? 
              AND chatId = ?
        )
      ORDER BY message.timestamp ASC
      LIMIT ? + 1
    )
    ORDER BY timestamp DESC
    `,
    [chatId, messageId, chatId, limit],
    (tx, results) => {
      const len = results.rows.length;
      for (let i = 0; i < len; i++) {
        let entry = results.rows.item(i);
        entry.data = JSON.parse(entry.data);
        entry.sender = toBool(entry.sender);
        entry.shouldAck = toBool(entry.shouldAck);
        entry.hasReaction = toBool(entry.hasReaction);
        entry.reply = {
          contentType: entry.reply_contentType,
          data: JSON.parse(entry.reply_data),
          sender: toBool(entry.reply_sender),
          chatId: entry.reply_chatId,
          messageId: entry.reply_messageId,
          timestamp: entry.reply_timestamp,
        };
        messageList.push(entry);
      }
    },
  );

  return messageList;
}

/**
 * Fetch messages before the given messageId with a specified limit
 * @param chatId The chat to search in
 * @param messageId The messageId to search before
 * @param limit The number of messages to fetch (default 25)
 * @returns An array of LoadedMessages fetched before the given messageId
 */
export async function getMessagesBeforeMessageId(
  chatId: string,
  messageId: string,
  limit: number = 25,
): Promise<LoadedMessage[]> {
  let messageList: LoadedMessage[] = [];

  await runSimpleQuery(
    `
    SELECT
      message.chatId AS chatId,
      message.messageId AS messageId,
      message.contentType AS contentType,
      message.data AS data,
      message.timestamp AS timestamp,
      message.sender AS sender,
      message.messageStatus AS messageStatus,
      message.expiresOn AS expiresOn,
      message.shouldAck AS shouldAck,
      message.hasReaction AS hasReaction,
      message.readTimestamp AS readTimestamp,
      message.deliveredTimestamp AS deliveredTimestamp,
      message.mtime AS mtime,
      message.mediaId AS mediaId,
      media.filePath AS filePath,
      reply.contentType AS reply_contentType,
      reply.data AS reply_data,
      reply.sender AS reply_sender,
      reply.chatId AS reply_chatId,
      reply.messageId AS reply_messageId,
      reply.timestamp AS reply_timestamp
    FROM lineMessages message
    LEFT JOIN lineMessages reply ON message.replyId = reply.messageId
    LEFT JOIN media ON message.mediaId = media.mediaId
    WHERE message.chatId = ? 
      AND message.timestamp <= (
          SELECT timestamp
          FROM lineMessages
          WHERE messageId = ? 
            AND chatId = ?
      )
    ORDER BY message.timestamp DESC
    LIMIT ? + 1
    `,
    [chatId, messageId, chatId, limit],
    (tx, results) => {
      const len = results.rows.length;
      for (let i = 0; i < len; i++) {
        let entry = results.rows.item(i);
        entry.data = JSON.parse(entry.data);
        entry.sender = toBool(entry.sender);
        entry.shouldAck = toBool(entry.shouldAck);
        entry.hasReaction = toBool(entry.hasReaction);
        entry.reply = {
          contentType: entry.reply_contentType,
          data: JSON.parse(entry.reply_data),
          sender: toBool(entry.reply_sender),
          chatId: entry.reply_chatId,
          messageId: entry.reply_messageId,
          timestamp: entry.reply_timestamp,
        };
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
  let messages: string[] = [];
  await runSimpleQuery(
    `
    SELECT messageId FROM lineMessages
    WHERE chatId = ?
    `,
    [chatId],
    (tx, results) => {
      for (let i = 0; i < results.rows.length; i++) {
        let entry = results.rows.item(i).messageId;
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
  let unsent: LineMessageData[] = [];
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
  let expired: LineMessageData[] = [];
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
