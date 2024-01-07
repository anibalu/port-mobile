import {ContactSharingMap} from '@utils/ContactSharing/interfaces';
import * as dbCalls from './DBCalls/contactSharing';
/**
 * Save a contact sharing entry
 * @param entry An new contact sharing entry to save
 */
export async function newContactSharingEntry(entry: ContactSharingMap) {
  await dbCalls.newContactSharingEntry(entry);
}

/**
 * Get all forwarding requests for a particular lineId
 * @param source a 32 char source identifier
 * @returns
 */
export async function getEntriesForSource(source: string) {
  return await dbCalls.getEntriesForSource(source);
}

/**
 * Delete a specific contact sharing entry
 * @param entry the entry to delte
 */
export async function deleteContactSharingEntry(entry: ContactSharingMap) {
  await dbCalls.deleteContactSharingEntry(entry);
}
