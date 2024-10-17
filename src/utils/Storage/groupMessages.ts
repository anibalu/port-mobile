import * as groupDBCalls from './DBCalls/groupMessage';
import {UpdateParams} from './messages';
import {deleteMedia} from './media';
import {generateISOTimeStamp} from '@utils/Time';
import {
  ContentType,
  DataType,
  LargeDataMessageContentTypes,
  MessageStatus,
} from '@utils/Messaging/interfaces';
import {ConnectionInfo} from './DBCalls/connections';
import {getConnection, updateConnection} from './connections';
import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';

/**
 * saves group message to storage.
 * @param {groupDBCalls.GroupMessageData} message - message to save
 */
export async function saveGroupMessage(
  message: groupDBCalls.GroupMessageData,
): Promise<void> {
  await groupDBCalls.addMessage(message);
  return;
}

/**
 *
 * @param {string} chatId
 * @param {string} messageId
 * @returns {Promise<{groupDBCalls.GroupMessageData|null}>} - message for the given chat and messsageId, if it exists
 */
export async function getGroupMessage(
  chatId: string,
  messageId: string,
): Promise<null | groupDBCalls.GroupMessageData> {
  return await groupDBCalls.getMessage(chatId, messageId);
}

/**
 * Get fully loaded message
 * @param chatId
 * @param messageId
 * @returns - message with additional attributes joined to it.
 */
export async function getLoadedGroupMessage(
  chatId: string,
  messageId: string,
): Promise<groupDBCalls.LoadedGroupMessage | null> {
  return await groupDBCalls.getLoadedMessage(chatId, messageId);
}

/**
 * Update just the data field of an existing message in storage
 * @param chatId the chatId of a message in storage
 * @param messageId the messageId of a message in storage
 * @param data the new data value
 */
export async function updateGroupMessageData(
  chatId: string,
  messageId: string, //with sender prefix
  data: DataType, //{...data,deleted:true}
): Promise<void> {
  await groupDBCalls.updateSavedMessage(chatId, messageId, {data: data});
}

/**
 * Params used by a few update functions in this file.
 * TODO - We need to move away from this eventually.
 */
export interface UpdateGroupParams {
  messageIdToBeUpdated: string;
  updatedMessageStatus?: MessageStatus | null;
  updatedContentType?: ContentType;
}

/**
 * Set the status of a message in storage
 * @param chatId the chatId of the message to update
 * @param updateParams the params to update
 * @returns
 */
export async function updateGroupMessageStatus(
  chatId: string,
  updateParams: UpdateParams,
): Promise<void> {
  await groupDBCalls.updateSavedMessage(
    chatId,
    updateParams.messageIdToBeUpdated,
    {
      messageStatus: updateParams.updatedMessageStatus,
      contentType: updateParams.updatedContentType,
    },
  );
}

/**
 * Get a list of journaled group messages
 * @returns list of journaled group messages
 */
export async function getGroupJournaled(): Promise<
  groupDBCalls.GroupMessageData[]
> {
  return await groupDBCalls.getUnsent();
}

/**
 * Get a list of all saved messages that have expired
 * @param currentTimestamp The current time in ISOString format
 * @returns a list of all expired messages
 */
export async function getExpiredGroupMessages(
  currentTimestamp: string,
): Promise<groupDBCalls.GroupMessageData[]> {
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

/**
 * Cleanly delete a message while taking media and reactions into consideration
 * @param chatId
 * @param messageId
 * @param tombstone If true, data is emptied and content type is set to deleted.
 * If false, message is permanently deleted.
 * @todo - move out unnecessary logic from this helper.
 */
export async function cleanDeleteGroupMessage(
  chatId: string,
  messageId: string,
  tombstone: boolean = false,
) {
  const message = await getGroupMessage(chatId, messageId);
  let connection: ConnectionInfo;
  try {
    connection = await getConnection(chatId);
  } catch (e) {
    console.error('The chat associated with this message no longer exists', e);
    groupDBCalls.permanentlyDeleteMessage(chatId, messageId);
  }
  if (!connection!) {
    // Something very wrong is happening here
    return;
  }
  //checks if passed in messageId belongs to the latest message
  const isLatestMessage: boolean = messageId === connection.latestMessageId;
  if (message) {
    const contentType = message.contentType;
    if (LargeDataMessageContentTypes.includes(contentType)) {
      const mediaId = message.mediaId;
      await deleteMedia(mediaId);
    }
    //if message contains reaction, set the chat tile with latest message contents
    if (message.hasReaction) {
      const latestMessage = await getGroupMessage(
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
      groupDBCalls.updateSavedMessage(chatId, messageId, {
        contentType: ContentType.deleted,
        data: {},
      });
    } else {
      await permanentlyDeleteGroupMessage(chatId, messageId);
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
async function getAllGroupMessages(chatId: string): Promise<string[]> {
  return await groupDBCalls.getAllMessagesIdsInChat(chatId);
}

/**
 * Cleanly deletes all the messages in a Chat
 * @param chatId string: The ID of the chat to retrieve messages for.
 */
export async function deleteAllMessagesInChat(chatId: string) {
  const messageIds: string[] = await getAllGroupMessages(chatId);
  for (const messageId of messageIds) {
    await cleanDeleteGroupMessage(chatId, messageId, false);
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
 * Get the latest messages in a chat
 * @param chatId
 * @param limit The maximum number of latest messages to return
 * @returns Up to the <limit> latest messages in <chatId>
 */
export async function getLatestGroupMessages(
  chatId: string,
  limit: number = 50,
): Promise<groupDBCalls.LoadedGroupMessage[]> {
  return await groupDBCalls.getLatestMessages(chatId, limit);
}

/**
 * Set that a message contains reactions.
 * @param chatId
 * @param messageId
 */
export async function setHasGroupReactions(chatId: string, messageId: string) {
  await groupDBCalls.updateSavedMessage(chatId, messageId, {hasReaction: true});
}
