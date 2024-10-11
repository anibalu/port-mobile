import {runSimpleQuery, toBool} from './dbCommon';
import {ContentType, MessageStatus} from '@utils/Messaging/interfaces';
import {generateISOTimeStamp} from '@utils/Time';

export interface updateGroupMessageParams {
  contentType?: ContentType | null; // What type of message the content is
  data?: any; // The content itself
  replyId?: string | null; // The id of the message this was sent as a reply to
  timestamp?: string | null; // When the message was sent/received
  messageStatus?: MessageStatus | null; // What state is the message in eg: read/unsent
  hasReaction?: boolean | null; // Does this message have reactions
  expiresOn?: string | null; // When does this message need to disappear after
  mediaId?: string | null; // ID of potentially associated media
}

export interface GroupMessageData extends updateGroupMessageParams {
  messageId: string;
  chatId: string; // What chat does this message belong to
  sender: boolean; // Whether the message was sent by this device
  mtime?: string | null; // When was this message last modified
  contentType: ContentType;
  data: any;
  memberId?: string | null;
  singleRecepient?: string | null;
}

export interface GroupReplyContent {
  contentType: ContentType | null;
  data: any | null;
  sender: boolean | null;
  chatId: string | null;
  memberId: string | null;
  name: string | null;
  displayPic: string | null;
  messageId: string | null;
  timestamp: string | null;
}

export interface LoadedGroupMessage {
  chatId: string;
  messageId: string;
  contentType: ContentType;
  data: any;
  timestamp: string;
  sender: boolean;
  memberId: string | null;
  singleRecepient: string | null;
  messageStatus: MessageStatus;
  expiresOn: string | null;
  hasReaction: boolean | null;
  mtime: string | null;
  reply: GroupReplyContent;
  mediaId: string | null;
  filePath: string | null;
  name: string | null;
  displayPic: string | null;
  isHighlighted?: boolean | null;
}

export async function addMessage(message: GroupMessageData) {
  await runSimpleQuery(
    `
    INSERT INTO groupMessages (
      messageId,
      chatId,
      contentType,
      data,
      replyId,
      mediaId,
      sender,
      memberId,
      timestamp,
      messageStatus,
      expiresOn,
      hasReaction,
      singleRecepient,
      mtime
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ;
    `,
    [
      message.messageId,
      message.chatId,
      message.contentType,
      JSON.stringify(message.data),
      message.replyId,
      message.mediaId,
      message.sender,
      message.memberId,
      message.timestamp,
      message.messageStatus,
      message.expiresOn,
      message.hasReaction,
      message.singleRecepient,
      generateISOTimeStamp(),
    ],
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
): Promise<null | GroupMessageData> {
  let entry = null;
  await runSimpleQuery(
    `
    SELECT * FROM groupMessages
    WHERE chatId = ? and messageId = ? ;
    `,
    [chatId, messageId],
    (tx, results) => {
      if (results.rows.length) {
        entry = results.rows.item(0);
        entry.data = JSON.parse(entry.data);
        entry.sender = toBool(entry.sender);
        entry.hasReaction = toBool(entry.hasReaction);
      }
    },
  );
  return entry;
}

/**
 * Get fully loaded message
 * @param chatId
 * @param messageId
 * @returns - message with additional attributes joined to it.
 */
export async function getLoadedMessage(
  chatId: string,
  messageId: string,
): Promise<LoadedGroupMessage | null> {
  let message: LoadedGroupMessage | null = null;
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
      message.hasReaction as hasReaction,
      message.mtime as mtime,
      message.memberId as memberId,
      message.singleRecepient as singleRecepient,
      message.mediaId as mediaId,
      media.filePath as filePath,
      contact.name as name,
      contact.displayPic as displayPic,
      reply.contentType as reply_contentType,
      reply.data as reply_data,
      reply.sender as reply_sender,
      reply.memberId as reply_memberId,
      reply.chatId as reply_chatId,
      contactReply.name as reply_name,
      contactReply.displayPic as reply_displayPic
    FROM
      (SELECT * FROM groupMessages
      WHERE chatId = ? AND messageId = ?) message
      LEFT JOIN 
      groupMessages reply
      ON message.replyId = reply.messageId
      LEFT JOIN
      media
      ON message.mediaId = media.mediaId
      LEFT JOIN
      groupMembers groupMember
      ON message.memberId = groupMember.memberId
      LEFT JOIN
      contacts contact
      ON groupMember.pairHash = contact.pairHash
      LEFT JOIN
      groupMembers groupMemberReply
      ON reply.memberId = groupMemberReply.memberId
      LEFT JOIN
      contacts contactReply
      ON groupMemberReply.pairHash = contactReply.pairHash
    ;
    `,
    [chatId, messageId],
    (tx, results) => {
      const len = results.rows.length;
      let entry;
      if (len > 0) {
        entry = results.rows.item(0);
        // We convert some columns into correct destination types
        entry.data = JSON.parse(entry.data);
        entry.sender = toBool(entry.sender);
        entry.hasReaction = toBool(entry.hasReaction);
        // We convert the reply columns into a more typescript friendly format
        entry.reply = {};
        entry.reply.contentType = entry.reply_contentType;
        entry.reply.data = JSON.parse(entry.reply_data);
        entry.reply.sender = toBool(entry.reply_sender);
        entry.reply.memberId = entry.reply_memberId;
        entry.reply.chatId = entry.reply_chatId;
        entry.reply.name = entry.reply_name;
        entry.reply.displayPic = entry.reply_displayPic;
        message = entry;
      }
    },
  );
  return message;
}

/**
 *  Get the latest messages in a chat, including the timestamp of any reply
 * @param chatId
 * @param limit The maximum number of latest messages to return
 * @returns Up to the <limit> latest messages in <chatId>
 */
export async function getLatestMessages(
  chatId: string,
  limit: number = 50,
): Promise<LoadedGroupMessage[]> {
  let messageList: LoadedGroupMessage[] = [];
  /**
   * We begin by getting the first <limit> most recent messages and alias
   * that to the table messages.
   * Next we left join that with the groupMessages table aliased to reply.
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
      message.hasReaction as hasReaction,
      message.mtime as mtime,
      message.memberId as memberId,
      message.singleRecepient as singleRecepient,
      message.mediaId as mediaId,
      media.filePath as filePath,
      contact.name as name,
      contact.displayPic as displayPic,
      reply.contentType as reply_contentType,
      reply.data as reply_data,
      reply.sender as reply_sender,
      reply.messageId as reply_messageId,
      reply.timestamp as reply_timestamp,
      reply.memberId as reply_memberId,
      contactReply.name as reply_name,
      contactReply.displayPic as reply_displayPic
    FROM
      (SELECT * FROM groupMessages
      WHERE chatId = ?
      ORDER BY timestamp DESC
      LIMIT ?) message
      LEFT JOIN 
      groupMessages reply
      ON message.replyId = reply.messageId
      LEFT JOIN
      media
      ON message.mediaId = media.mediaId
      LEFT JOIN
      groupMembers groupMember
      ON message.memberId = groupMember.memberId
      LEFT JOIN
      contacts contact
      ON groupMember.pairHash = contact.pairHash
      LEFT JOIN
      groupMembers groupMemberReply
      ON reply.memberId = groupMemberReply.memberId
      LEFT JOIN
      contacts contactReply
      ON groupMemberReply.pairHash = contactReply.pairHash
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
        entry.hasReaction = toBool(entry.hasReaction);

        entry.reply = {
          contentType: entry.reply_contentType,
          data: JSON.parse(entry.reply_data),
          sender: toBool(entry.reply_sender),
          messageId: entry.reply_messageId,
          memberId: entry.reply_memberId,
          timestamp: entry.reply_timestamp,
          chatId: entry.reply_chatId,
          name: entry.reply_name,
          displayPic: entry.reply_displayPic,
        };

        // Push the processed entry to the message list
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
 * @returns An array of LoadedGroupMessage fetched after the given messageId
 */
export async function getGroupMessagesAfterMessageId(
  chatId: string,
  messageId: string,
  limit: number = 25,
): Promise<LoadedGroupMessage[]> {
  let messageList: LoadedGroupMessage[] = [];

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
      message.hasReaction as hasReaction,
      message.mtime as mtime,
      message.memberId as memberId,
      message.singleRecepient as singleRecepient,
      message.mediaId as mediaId,
      media.filePath as filePath,
      contact.name as name,
      contact.displayPic as displayPic,
      reply.contentType as reply_contentType,
      reply.data as reply_data,
      reply.sender as reply_sender,
      reply.memberId as reply_memberId,
      reply.messageId as reply_messageId,
      reply.timestamp as reply_timestamp,
      contactReply.name as reply_name,
      contactReply.displayPic as reply_displayPic
    FROM
      groupMessages message
    LEFT JOIN 
      groupMessages reply
      ON message.replyId = reply.messageId
    LEFT JOIN
      media
      ON message.mediaId = media.mediaId
    LEFT JOIN
      groupMembers groupMember
      ON message.memberId = groupMember.memberId
    LEFT JOIN
      contacts contact
      ON groupMember.pairHash = contact.pairHash
    LEFT JOIN
      groupMembers groupMemberReply
      ON reply.memberId = groupMemberReply.memberId
    LEFT JOIN
      contacts contactReply
      ON groupMemberReply.pairHash = contactReply.pairHash
    WHERE message.chatId = ?
      AND message.timestamp >= (
        SELECT timestamp FROM groupMessages WHERE messageId = ? AND chatId = ?
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
        entry.hasReaction = toBool(entry.hasReaction);
        entry.reply = {
          contentType: entry.reply_contentType,
          data: JSON.parse(entry.reply_data),
          sender: toBool(entry.reply_sender),
          chatId: entry.reply_chatId,
          messageId: entry.reply_messageId,
          timestamp: entry.reply_timestamp,
          memberId: entry.reply_memberId,
          name: entry.reply_name,
          displayPic: entry.reply_displayPic,
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
 * @returns An array of LoadedGroupMessage fetched before the given messageId
 */
export async function getGroupMessagesBeforeMessageId(
  chatId: string,
  messageId: string,
  limit: number = 25,
): Promise<LoadedGroupMessage[]> {
  let messageList: LoadedGroupMessage[] = [];

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
      message.hasReaction as hasReaction,
      message.mtime as mtime,
      message.memberId as memberId,
      message.singleRecepient as singleRecepient,
      message.mediaId as mediaId,
      media.filePath as filePath,
      contact.name as name,
      contact.displayPic as displayPic,
      reply.contentType as reply_contentType,
      reply.data as reply_data,
      reply.sender as reply_sender,
      reply.messageId as reply_messageId,
      reply.timestamp as reply_timestamp,
      reply.memberId as reply_memberId,
      contactReply.name as reply_name,
      contactReply.displayPic as reply_displayPic
    FROM
      groupMessages message
    LEFT JOIN 
      groupMessages reply
      ON message.replyId = reply.messageId
    LEFT JOIN
      media
      ON message.mediaId = media.mediaId
    LEFT JOIN
      groupMembers groupMember
      ON message.memberId = groupMember.memberId
    LEFT JOIN
      contacts contact
      ON groupMember.pairHash = contact.pairHash
    LEFT JOIN
      groupMembers groupMemberReply
      ON reply.memberId = groupMemberReply.memberId
    LEFT JOIN
      contacts contactReply
      ON groupMemberReply.pairHash = contactReply.pairHash
    WHERE message.chatId = ?
    AND message.timestamp <= (
      SELECT timestamp FROM groupMessages WHERE messageId = ? AND chatId = ?
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
        entry.hasReaction = toBool(entry.hasReaction);
        entry.reply = {
          contentType: entry.reply_contentType,
          data: JSON.parse(entry.reply_data),
          sender: toBool(entry.reply_sender),
          chatId: entry.reply_chatId,
          messageId: entry.reply_messageId,
          timestamp: entry.reply_timestamp,
          memberId: entry.reply_memberId,
          name: entry.reply_name,
          displayPic: entry.reply_displayPic,
        };
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
export async function getGroupMessagesAroundTimestamp(
  chatId: string,
  timestamp: string,
): Promise<LoadedGroupMessage[]> {
  let messageList: LoadedGroupMessage[] = [];

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
      message.hasReaction as hasReaction,
      message.mtime as mtime,
      message.memberId as memberId,
      message.singleRecepient as singleRecepient,
      message.mediaId as mediaId,
      media.filePath as filePath,
      contact.name as name,
      contact.displayPic as displayPic,
      reply.contentType as reply_contentType,
      reply.data as reply_data,
      reply.sender as reply_sender,
      reply.messageId as reply_messageId,
      reply.timestamp as reply_timestamp,
      reply.memberId as reply_memberId,
      contactReply.name as reply_name,
      contactReply.displayPic as reply_displayPic,
      CASE WHEN message.timestamp = ? THEN 1 ELSE 0 END as isHighlighted
      FROM
        groupMessages message
      LEFT JOIN 
        groupMessages reply ON message.replyId = reply.messageId
      LEFT JOIN
        media ON message.mediaId = media.mediaId
      LEFT JOIN
        groupMembers groupMember ON message.memberId = groupMember.memberId
      LEFT JOIN
        contacts contact ON groupMember.pairHash = contact.pairHash
      LEFT JOIN
        groupMembers groupMemberReply ON reply.memberId = groupMemberReply.memberId
      LEFT JOIN
        contacts contactReply ON groupMemberReply.pairHash = contactReply.pairHash
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
      message.hasReaction as hasReaction,
      message.mtime as mtime,
      message.memberId as memberId,
      message.singleRecepient as singleRecepient,
      message.mediaId as mediaId,
      media.filePath as filePath,
      contact.name as name,
      contact.displayPic as displayPic,
      reply.contentType as reply_contentType,
      reply.data as reply_data,
      reply.sender as reply_sender,
      reply.messageId as reply_messageId,
      reply.timestamp as reply_timestamp,
      reply.memberId as reply_memberId,
      contactReply.name as reply_name,
      contactReply.displayPic as reply_displayPic,
      CASE WHEN message.timestamp = ? THEN 1 ELSE 0 END as isHighlighted
      FROM
        groupMessages message
      LEFT JOIN 
        groupMessages reply
        ON message.replyId = reply.messageId
      LEFT JOIN
        media
        ON message.mediaId = media.mediaId
      LEFT JOIN
        groupMembers groupMember
        ON message.memberId = groupMember.memberId
      LEFT JOIN
        contacts contact
        ON groupMember.pairHash = contact.pairHash
      LEFT JOIN
        groupMembers groupMemberReply
        ON reply.memberId = groupMemberReply.memberId
      LEFT JOIN
        contacts contactReply
        ON groupMemberReply.pairHash = contactReply.pairHash
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
        entry.hasReaction = toBool(entry.hasReaction);
        entry.reply = {
          contentType: entry.reply_contentType,
          data: JSON.parse(entry.reply_data),
          sender: toBool(entry.reply_sender),
          chatId: entry.reply_chatId,
          messageId: entry.reply_messageId,
          timestamp: entry.reply_timestamp,
          memberId: entry.reply_memberId,
          name: entry.reply_name,
          displayPic: entry.reply_displayPic,
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
  updateParams: updateGroupMessageParams,
) {
  await runSimpleQuery(
    /**
     * You may notice that some coalesces are backwards from the rest.
     * This is because some columns cannot be updated from non-null values.
     */
    `
    UPDATE groupMessages SET
      contentType = COALESCE(?, contentType),
      data = COALESCE(?, data),
      replyId = COALESCE(?, replyId),
      timestamp = COALESCE(?, timestamp),
      messageStatus = COALESCE(?, messageStatus),
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
    SELECT messageId FROM groupMessages
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
 * Get ALL unsent messages
 * @returns all messages that haven't been sent
 */
export async function getUnsent(): Promise<GroupMessageData[]> {
  let unsent: GroupMessageData[] = [];
  await runSimpleQuery(
    `
    SELECT * FROM groupMessages 
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
        entry.hasReaction = toBool(entry.hasReaction);
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
): Promise<GroupMessageData[]> {
  let expired: GroupMessageData[] = [];
  await runSimpleQuery(
    `
    SELECT * FROM groupMessages 
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
        entry.hasReaction = toBool(entry.hasReaction);
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
    DELETE FROM groupMessages 
    WHERE chatId = ? AND messageId = ? ;
    `,
    [chatId, messageId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * delete ALL unsent messages
 */
export async function deleteUnsent() {
  await runSimpleQuery(
    `
    DELETE FROM groupMessages 
    WHERE messageStatus = ? ;
    `,
    [MessageStatus.journaled],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}
