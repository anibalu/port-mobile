import {SavedMessageParams, SendStatus} from '../Messaging/interfaces';
import {
  readMessagesRNFS,
  saveMessageRNFS,
  updateMessageRNFS,
  updateMessageSendStatusRNFS,
} from './StorageRNFS/messagesHandlers';

/**
 * saves message to storage.
 * @param {string} chatId - chatId of chat
 * @param {SavedMessageParams} message - message to save
 * @param {boolean} blocking - whether the function should block operations until completed. default = false.
 */
export async function saveMessage(
  chatId: string,
  message: SavedMessageParams,
  blocking: boolean = true,
): Promise<void> {
  await saveMessageRNFS(chatId, message, blocking);
}

/**
 * reads messages of a chat from storage
 * @param {string} chatId - chatId of chat
 * @param {boolean} blocking - whether the function should block operations until completed. default = false.
 * @returns {Promise<SavedMessageParams[]>} - messages in storage
 */
export async function readMessages(
  chatId: string,
  blocking: boolean = true,
): Promise<SavedMessageParams[]> {
  return await readMessagesRNFS(chatId, blocking);
}

export async function updateMessageSendStatus(
  chatId: string,
  messageId: string, //with sender prefix
  updatedStatus: SendStatus,
  blocking: boolean = false,
): Promise<void> {
  await updateMessageSendStatusRNFS(chatId, messageId, updatedStatus, blocking);
}

export async function updateMessage(
  chatId: string,
  messageId: string, //with sender prefix
  update: SavedMessageParams,
  blocking: boolean = false,
): Promise<void> {
  await updateMessageRNFS(chatId, messageId, update, blocking);
}
