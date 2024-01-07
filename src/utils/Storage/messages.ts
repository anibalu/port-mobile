import {MessageStatus, SavedMessageParams} from '../Messaging/interfaces';
import * as DBCalls from './DBCalls/lineMessage';

/**
 * saves message to storage.
 * @param {SavedMessageParams} message - message to save
 */
export async function saveMessage(message: SavedMessageParams): Promise<void> {
  await DBCalls.addMessage(message);
  return;
}
/**
 *
 * @param {string} chatId
 * @param {string} messageId
 * @returns {Promise<{SavedMessageParams|null}>} - message for the given chat and messsageId, if it exists
 */
export async function getMessage(
  chatId: string,
  messageId: string,
): Promise<null | SavedMessageParams> {
  return await DBCalls.getMessage(chatId, messageId);
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
  await DBCalls.updateMessage(chatId, messageId, update);
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
  return await DBCalls.getPaginatedMessages(chatId, cursor);
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
  messageId: string, //with sender prefix
  updatedStatus: MessageStatus,
  deliveredTimestamp?: string,
  readTimestamp?: string,
): Promise<void> {
  if (updatedStatus || updatedStatus === 0) {
    if (deliveredTimestamp && updatedStatus === MessageStatus.delivered) {
      await DBCalls.updateStatusAndTimestamp(
        chatId,
        messageId,
        updatedStatus,
        deliveredTimestamp,
      );
    } else if (readTimestamp && updatedStatus === MessageStatus.read) {
      await DBCalls.updateStatusAndTimestamp(
        chatId,
        messageId,
        updatedStatus,
        undefined,
        readTimestamp,
      );
    } else if (updatedStatus === MessageStatus.sent) {
      await DBCalls.setSent(chatId, messageId);
    } else {
      await DBCalls.updateStatus(chatId, messageId, updatedStatus);
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
export async function getLatestMessages(
  chatId: string,
  latestTimestamp: string,
): Promise<SavedMessageParams[]> {
  return await DBCalls.getLatestMessages(chatId, latestTimestamp);
}

export async function getJournaled(): Promise<SavedMessageParams[]> {
  return await DBCalls.getUnsent();
}
