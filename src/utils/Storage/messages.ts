/**
 * Storage helpers for messages of direct chats
 */
import {generateISOTimeStamp} from '@utils/Time';
import {
  ContentType,
  DataType,
  LargeDataMessageContentTypes,
  MessageStatus,
} from '../Messaging/interfaces';
import * as lineDBCalls from './DBCalls/lineMessage';
import {deleteFile} from './StorageRNFS/sharedFileHandlers';
import {deleteMedia, getMedia} from './media';
import {getConnection, updateConnection} from './connections';
import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';

/**
 * saves message to storage.
 * @param {lineDBCalls.LineMessageData} message - message to save
 */
export async function saveMessage(
  message: lineDBCalls.LineMessageData,
): Promise<void> {
  await lineDBCalls.addMessage(message);
  return;
}

/**
 * @param {string} chatId
 * @param {string} messageId
 * @returns {Promise<{lineDBCalls.LineMessageData|null}>} - message for the given chat and messageId, if it exists
 */
export async function getMessage(
  chatId: string,
  messageId: string,
): Promise<null | lineDBCalls.LineMessageData> {
  return await lineDBCalls.getMessage(chatId, messageId);
}

/**
 * Update just the data field of an existing message in storage
 * @param chatId the chatId of a message in storage
 * @param messageId the messageId of a message in storage
 * @param data the new data value
 */
export async function updateMessageData(
  chatId: string,
  messageId: string, //with sender prefix
  data: DataType, //{...data,deleted:true}
): Promise<void> {
  await lineDBCalls.updateSavedMessage(chatId, messageId, {data: data});
}

/**
 * Params used by a few update functions in this file.
 * TODO - We need to move away from this eventually.
 */
export interface UpdateParams {
  messageIdToBeUpdated: string;
  updatedMessageStatus?: MessageStatus | null;
  deliveredAtTimestamp?: string | null;
  readAtTimestamp?: string | null;
  updatedContentType?: ContentType;
}

/**
 * Set the status of a message in storage
 * @param chatId the chatId of the message to update
 * @param updateParams the params to update
 * @returns
 */
export async function updateMessageStatus(
  chatId: string,
  updateParams: UpdateParams,
): Promise<void> {
  await lineDBCalls.updateSavedMessage(
    chatId,
    updateParams.messageIdToBeUpdated,
    {
      messageStatus: updateParams.updatedMessageStatus,
      deliveredTimestamp: updateParams.deliveredAtTimestamp,
      readTimestamp: updateParams.readAtTimestamp,
      contentType: updateParams.updatedContentType,
    },
  );
}

/**
 * Get a list of journaled direct messages
 * @returns list of journaled direct messages
 */
export async function getJournaled(): Promise<lineDBCalls.LineMessageData[]> {
  return await lineDBCalls.getUnsent();
}

/**
 * Get a list of all saved messages that have expired
 * @param currentTimestamp The current time in ISOString format
 * @returns a list of all expired messages
 */
export async function getExpiredMessages(
  currentTimestamp: string,
): Promise<lineDBCalls.LineMessageData[]> {
  return await lineDBCalls.getExpiredMessages(currentTimestamp);
}

/**
 * Delete a message permanently.
 * Not intended for use with deleting a regular message.
 * Intended for use with disappearing messages.
 * @param chatId chat Id of the chat
 * @param messageId message Id of the message to be deleted.
 */
export async function permanentlyDeleteMessage(
  chatId: string,
  messageId: string,
) {
  await lineDBCalls.permanentlyDeleteMessage(chatId, messageId);
}

/**
 * Cleanly delete a message while taking media and reactions into consideration
 * @param chatId
 * @param messageId
 * @param tombstone If true, data is emptied and content type is set to deleted.
 * If false, message is permanently deleted.
 * @todo - move out unnecessary logic from this helper.
 */
export async function cleanDeleteMessage(
  chatId: string,
  messageId: string,
  tombstone: boolean = false,
) {
  const message = await getMessage(chatId, messageId);
  const connection = await getConnection(chatId);
  if (!connection) {
    return;
  }
  //checks if passed in messageId belongs to the latest message
  const isLatestMessage: boolean = messageId === connection.latestMessageId;
  if (message) {
    const contentType = message.contentType;
    if (LargeDataMessageContentTypes.includes(contentType)) {
      const mediaId = message.mediaId;
      if (mediaId) {
        const mediaInfo = await getMedia(mediaId);
        if (mediaInfo?.filePath) {
          await deleteFile(mediaInfo?.filePath);
        }
        if (mediaInfo?.previewPath) {
          await deleteFile(mediaInfo?.previewPath);
        }
        await deleteMedia(mediaId);
      }
    }
    //if message contains reaction, set the chat tile with latest message contents
    if (message.hasReaction) {
      const latestMessage = await getMessage(
        chatId,
        connection.latestMessageId || '',
      );
      if (latestMessage) {
        const updatedText = getConnectionTextByContentType(
          latestMessage.contentType,
          latestMessage.data,
        );
        // Update updatedText based on the latest message
        await updateConnection({
          chatId: chatId,
          text: updatedText,
          readStatus: latestMessage.messageStatus,
          recentMessageType: latestMessage.contentType,
          timestamp: latestMessage.timestamp,
        });
      }
    }
    if (tombstone) {
      lineDBCalls.updateSavedMessage(chatId, messageId, {
        contentType: ContentType.deleted,
        data: {},
      });
    } else {
      await permanentlyDeleteMessage(chatId, messageId);
      if (isLatestMessage) {
        //shows the second latest message on chattile, if present,  of the person who deleted the msg
        await updateConnection({
          chatId: chatId,
          text: '',
        });
      }
    }
  }
}

/**
 * Retrieves all messages associated with a given chat ID.
 * @param chatId string: The ID of the chat to retrieve messages for.
 * @returns {string[]} A promise that resolves to an array of the message Ids.
 */
async function getAllMessages(chatId: string): Promise<string[]> {
  return await lineDBCalls.getAllMessagesIdsInChat(chatId);
}

/**
 * Cleanly deletes all the messages in a Chat
 * @param chatId string: The ID of the chat to retrieve messages for.
 */
export async function deleteAllMessagesInChat(chatId: string) {
  const messageIds: string[] = await getAllMessages(chatId);
  for (const messageId of messageIds) {
    await cleanDeleteMessage(chatId, messageId, false);
  }
}

/**
 * Cleanly delete all expired messages.
 */
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

/**
 * Get the latest messages in a chat
 * @param chatId
 * @param limit The maximum number of latest messages to return
 * @returns Up to the <limit> latest messages in <chatId>
 */
export async function getLatestMessages(
  chatId: string,
  limit: number = 50,
): Promise<lineDBCalls.LoadedMessage[]> {
  return await lineDBCalls.getLatestMessages(chatId, limit);
}

/**
 * Set a message as no longer requiring acknowledgement
 * @param chatId
 * @param messageId
 */
export async function setShouldNotAck(chatId: string, messageId: string) {
  await lineDBCalls.updateSavedMessage(chatId, messageId, {shouldAck: false});
}

/**
 * Set that a message contains reactions.
 * @param chatId
 * @param messageId
 */
export async function setHasReactions(chatId: string, messageId: string) {
  await lineDBCalls.updateSavedMessage(chatId, messageId, {hasReaction: true});
}
