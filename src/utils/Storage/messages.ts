import {generateISOTimeStamp} from '@utils/Time';
import {
  LargeDataMessageContentTypes,
  LargeDataParams,
  MessageStatus,
  SavedMessageParams,
} from '../Messaging/interfaces';
import * as groupDBCalls from './DBCalls/groupMessage';
import * as lineDBCalls from './DBCalls/lineMessage';
import {deleteFile} from './StorageRNFS/sharedFileHandlers';
import {deleteMedia} from './media';

/**
 * saves group message to storage.
 * @param {SavedMessageParams} message - message to save
 */
export async function saveGroupMessage(
  message: SavedMessageParams,
): Promise<void> {
  await groupDBCalls.addMessage(message);
  return;
}
/**
 *
 * @param {string} chatId
 * @param {string} messageId
 * @returns {Promise<{SavedMessageParams|null}>} - message for the given chat and messsageId, if it exists
 */
export async function getGroupMessage(
  chatId: string,
  messageId: string,
): Promise<null | SavedMessageParams> {
  return await groupDBCalls.getMessage(chatId, messageId);
}

export async function updateGroupReaction(
  chatId: string,
  messageId: string,
  hasReaction: boolean = false,
) {
  return await groupDBCalls.toggleReactionState(hasReaction, chatId, messageId);
}

/**
 * Update the data of an existing message in storage
 * @param chatId the chatId of a message in storage
 * @param messageId the messageId of a message in storage
 * @param update the new data value
 */
export async function updateGroupMessage(
  chatId: string,
  messageId: string, //with sender prefix
  update: any, //{...data,deleted:true}
): Promise<void> {
  await groupDBCalls.updateMessage(chatId, messageId, update);
}

/**
 * reads messages of a chat from storage using pagination
 * @param {string} chatId - chatId of chat
 * @param {number} startIndex - index to get the next 'X' messages from.
 * @returns {Promise<{DBCalls.MessageEntry[],number}>} - messages in storage
 */
export async function readPaginatedGroupMessages(
  chatId: string,
  cursor?: number,
): Promise<{
  messages: SavedMessageParams[];
  cursor: number;
  maxLength: number;
}> {
  return await groupDBCalls.getPaginatedMessages(chatId, cursor);
}

/**
 * Set the status of a message in storage
 * @param chatId the chatId of the message to update
 * @param messageId the messageId of message to update
 * @param updatedStatus the value to update to
 * @param blocking deprecated, unused value
 * @returns
 */
export async function updateGroupMessageSendStatus(
  chatId: string,
  updateParams: UpdateParams,
): Promise<void> {
  if (
    updateParams.updatedMessageStatus ||
    updateParams.updatedMessageStatus === 0
  ) {
    if (updateParams.updatedMessageStatus === MessageStatus.sent) {
      await groupDBCalls.setSent(chatId, updateParams.messageIdToBeUpdated);
    } else {
      await groupDBCalls.updateStatus(
        chatId,
        updateParams.messageIdToBeUpdated,
        updateParams.updatedMessageStatus,
      );
    }
    return;
  }
  console.log('attempted update without an actual status');
  return;
}

/**
 * @param chatId , chat to be loaded
 * @param latestTimestamp , lower bound of messages that need to be fetched
 * @returns {SavedMessageParams[]} list of messages
 * has been directly imported without abstraction
 */
export async function getLatestGroupMessages(
  chatId: string,
  latestTimestamp: string,
): Promise<SavedMessageParams[]> {
  return await groupDBCalls.getLatestMessages(chatId, latestTimestamp);
}

export async function getGroupJournaled(): Promise<SavedMessageParams[]> {
  return await groupDBCalls.getUnsent();
}

/**
 * Get a list of all saved messages that have expired
 * @param currentTimestamp The current time in ISOString format
 * @returns a list of all expired messages
 */
export async function getExpiredGroupMessages(
  currentTimestamp: string,
): Promise<SavedMessageParams[]> {
  return await groupDBCalls.getExpiredMessages(currentTimestamp);
}

/**
 * Delete a message permanently.
 * Not intended for use with deleting a regular message.
 * Intended for use with disappearing messages.
 * @param chatId 32 char id
 * @param messageId 32 char id
 */
export async function permanentlyDeleteGroupMessage(
  chatId: string,
  messageId: string,
) {
  await groupDBCalls.permanentlyDeleteMessage(chatId, messageId);
}

export async function cleanDeleteGroupMessage(
  chatId: string,
  messageId: string,
) {
  const message = await getMessage(chatId, messageId);
  if (message) {
    const contentType = message.contentType;
    if (LargeDataMessageContentTypes.includes(contentType)) {
      const data = message.data as LargeDataParams;
      const fileUri = data.fileUri;
      if (fileUri) {
        await deleteFile(fileUri);
        if (data.mediaId) {
          await deleteMedia(data.mediaId);
        }
      }
    }
    await permanentlyDeleteGroupMessage(chatId, messageId);
  }
}

export async function deleteExpiredGroupMessages() {
  const currentTimestamp = generateISOTimeStamp();
  const expiredMessages = await getExpiredGroupMessages(currentTimestamp);
  for (let index = 0; index < expiredMessages.length; index++) {
    await cleanDeleteGroupMessage(
      expiredMessages[index].chatId,
      expiredMessages[index].messageId,
    );
  }
}

/**
 * saves message to storage.
 * @param {SavedMessageParams} message - message to save
 */
export async function saveMessage(message: SavedMessageParams): Promise<void> {
  await lineDBCalls.addMessage(message);
  return;
}
/**
 * @param {string} chatId
 * @param {string} messageId
 * @returns {Promise<{SavedMessageParams|null}>} - message for the given chat and messageId, if it exists
 */
export async function getMessage(
  chatId: string,
  messageId: string,
): Promise<null | SavedMessageParams> {
  return await lineDBCalls.getMessage(chatId, messageId);
}

export async function updateReactionStatus(
  chatId: string,
  messageId: string,
  hasReaction: boolean = false,
) {
  return await lineDBCalls.toggleReactionState(hasReaction, chatId, messageId);
}

/**
 * Update the data of an existing message in storage
 * @param chatId the chatId of a message in storage
 * @param messageId the messageId of a message in storage
 * @param update the new data value
 */
export async function updateMessage(
  chatId: string,
  messageId: string, //with sender prefix
  update: any, //{...data,deleted:true}
): Promise<void> {
  await lineDBCalls.updateMessage(chatId, messageId, update);
}

/**
 * reads messages of a chat from storage using pagination
 * @param {string} chatId - chatId of chat
 * @param {number} startIndex - index to get the next 'X' messages from.
 * @returns {Promise<{DBCalls.MessageEntry[],number}>} - messages in storage
 */
export async function readPaginatedMessages(
  chatId: string,
  cursor?: number,
): Promise<{
  messages: SavedMessageParams[];
  cursor: number;
  maxLength: number;
}> {
  return await lineDBCalls.getPaginatedMessages(chatId, cursor);
}

/**
 * Set the status of a message in storage
 * @param chatId the chatId of the message to update
 * @param messageId the messageId of message to update
 * @param updatedStatus the value to update to
 * @param blocking deprecated, unused value
 * @param deliveredTimestamp time of message delivery
 * @param readTimestamp time of message reading
 * @returns
 */
export async function updateMessageSendStatus(
  chatId: string,
  updateParams: UpdateParams,
): Promise<void> {
  console.log(
    `Updating message ${updateParams.messageIdToBeUpdated} to status ${updateParams.updatedMessageStatus}`,
  );
  if (
    updateParams.updatedMessageStatus ||
    updateParams.updatedMessageStatus === 0
  ) {
    if (
      updateParams.deliveredAtTimestamp &&
      updateParams.updatedMessageStatus === MessageStatus.delivered
    ) {
      await lineDBCalls.updateStatusAndTimestamp(
        chatId,
        updateParams.messageIdToBeUpdated,
        updateParams,
      );
    } else if (
      updateParams.readAtTimestamp &&
      updateParams.updatedMessageStatus === MessageStatus.read
    ) {
      await lineDBCalls.updateStatusAndTimestamp(
        chatId,
        updateParams.messageIdToBeUpdated,
        updateParams,
      );
    } else if (updateParams.updatedMessageStatus === MessageStatus.sent) {
      await lineDBCalls.setSent(chatId, updateParams.messageIdToBeUpdated);
    } else {
      await lineDBCalls.updateStatus(
        chatId,
        updateParams.messageIdToBeUpdated,
        updateParams.updatedMessageStatus,
      );
    }
    return;
  }
  console.log('attempted update without an actual status');
  return;
}

export async function getJournaled(): Promise<SavedMessageParams[]> {
  return await lineDBCalls.getUnsent();
}

/**
 * Get a list of all saved messages that have expired
 * @param currentTimestamp The current time in ISOString format
 * @returns a list of all expired messages
 */
export async function getExpiredMessages(
  currentTimestamp: string,
): Promise<SavedMessageParams[]> {
  return await lineDBCalls.getExpiredMessages(currentTimestamp);
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
  await lineDBCalls.permanentlyDeleteMessage(chatId, messageId);
}

/**
 * Cleanly deletie a message while taking media into consideratioin
 * @param chatId
 * @param messageId
 * @param tombstone Whether to set the contentType to deleted
 */
export async function cleanDeleteMessage(
  chatId: string,
  messageId: string,
  tombstone: boolean = false,
) {
  const message = await getMessage(chatId, messageId);
  if (message) {
    const contentType = message.contentType;
    if (LargeDataMessageContentTypes.includes(contentType)) {
      const data = message.data as LargeDataParams;
      const fileUri = data.fileUri;
      if (fileUri) {
        await deleteFile(fileUri);
        if (data.mediaId) {
          await deleteMedia(data.mediaId);
        }
      }
    }
    if (tombstone) {
      lineDBCalls.markMessageAsDeleted(chatId, messageId);
    } else {
      await permanentlyDeleteMessage(chatId, messageId);
    }
  }
}

export async function deleteExpiredMessages() {
  const currentTimestamp = generateISOTimeStamp();
  const expiredMessages = await getExpiredMessages(currentTimestamp);
  for (let index = 0; index < expiredMessages.length; index++) {
    await cleanDeleteMessage(
      expiredMessages[index].chatId,
      expiredMessages[index].messageId,
    );
  }
}

export async function setHasReactions(chatId: string, messageId: string) {
  lineDBCalls.setHasReactions(chatId, messageId);
}

/**
 * Get the (k) latest messages in a chat
 * @param chatId
 * @param limit
 * @returns
 */
export async function getLatestMessages(chatId: string, limit: number = 50) {
  return lineDBCalls.getLatestMessages(chatId, limit);
}

export async function setReceipt(
  chatId: string,
  messageId: string,
  deliveredAt: string | null,
  readAt: string | null,
) {
  const updatedMessageStatus = readAt
    ? MessageStatus.read
    : MessageStatus.delivered;
  lineDBCalls.setReceipts(
    chatId,
    messageId,
    readAt,
    deliveredAt,
    updatedMessageStatus,
  );
}

/**
 * Set a message as no longer requiring acknowledgement
 * @param chatId
 * @param messageId
 */
export async function setShouldNotAck(chatId: string, messageId: string) {
  await lineDBCalls.setShouldNotAck(chatId, messageId);
}
