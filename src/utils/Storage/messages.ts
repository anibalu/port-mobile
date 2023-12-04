import {SavedMessageParams, SendStatus} from '../Messaging/interfaces';
import * as DBCalls from './DBCalls/lineMessage';

/**
 * saves message to storage.
 * @param {string} chatId - chatId of chat
 * @param {SavedMessageParams} message - message to save
 * @param {boolean} blocking - deprecated, unused value
 */
export async function saveMessage(
  //chatId: string,
  message: SavedMessageParams,
  blocking: boolean = true,
): Promise<void> {
  blocking.toString();
  await DBCalls.addMessage({...message});
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
 * @returns
 */
export async function updateMessageSendStatus(
  chatId: string,
  messageId: string, //with sender prefix
  updatedStatus: SendStatus,
  blocking: boolean = false,
): Promise<void> {
  blocking.toString();
  if (updatedStatus || updatedStatus === 0) {
    if (updatedStatus === SendStatus.success) {
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
 * Update the data of an existing message in storage
 * @param chatId the chatId of a message in storage
 * @param messageId the messageId of a message in storage
 * @param update the new data value
 * @param blocking unused, deprecated value
 */
export async function updateMessage(
  chatId: string,
  messageId: string, //with sender prefix
  update: any, //{...data,deleted:true}
  blocking: boolean = false,
): Promise<void> {
  blocking.toString();
  await DBCalls.updateMessage(chatId, messageId, update);
}
