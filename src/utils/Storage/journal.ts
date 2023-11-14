import {JournaledMessageParams} from '../Messaging/interfaces';
import {
  addToJournalRNFS,
  overwriteJournalRNFS,
  readJournalRNFS,
} from './StorageRNFS/journalHandlers';
import * as DBCalls from './DBCalls/lineMessage';

/**
 * Adds a message to the journal storage.
 * @param {JournaledMessageParams} message - The message object to add to the journal storage.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false
 * @returns {Promise<void>} A Promise that resolves once the message is added to the journal storage.
 */
export async function addToJournal(
  message: JournaledMessageParams,
  blocking: boolean = false,
): Promise<void> {
  await addToJournalRNFS(message, blocking);
}

/**
 * Overwrites the journal storage with a new set of prepared messages.
 * @param {Array<JournaledMessageParams>} queue - The array of messages to overwrite the journal storage with.
 * @param {boolean} blocking - whether the function should block operations until completed. default = false
 * @returns {Promise<void>} A Promise that resolves once the journal storage is overwritten.
 */
export async function overwriteJournal(
  queue: Array<JournaledMessageParams>,
  blocking: boolean = false,
): Promise<void> {
  await overwriteJournalRNFS(queue, blocking);
}

/**
 * Reads the messages from the journalled messages storage.
 * @param {boolean} blocking - whether the function should block operations until completed. default = false
 * @returns {Promise<Array<JournaledMessageParams>>} A Promise that resolves to an array of messages from the journal storage.
 */
export async function readJournal(
  blocking: boolean = false,
): Promise<Array<JournaledMessageParams>> {
  return await readJournalRNFS(blocking);
}

export async function getJournaled(): Promise<JournaledMessageParams[]> {
  return await DBCalls.getUnsent();
}
