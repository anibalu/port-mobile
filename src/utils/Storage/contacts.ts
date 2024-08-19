import * as DBCalls from './DBCalls/contacts';

/**
 * Get all of the user's contacts
 * @returns All contacts
 */
export async function getContacts(): Promise<DBCalls.ContactEntry[]> {
  return await DBCalls.getContacts();
}

/**
 * Get info associate with a contact
 * @returns contact info
 */
export async function getContact(
  pairHash: string,
): Promise<DBCalls.ContactEntry> {
  const contact = await DBCalls.getContact(pairHash);
  if (!contact) {
    throw new Error('No such contact');
  }
  return contact;
}

/**
 * Adds new contact to the contacts table
 * @param contact - new contact to add
 */
export async function addContact(contact: DBCalls.ContactEntry) {
  await DBCalls.addContact(contact);
}

/**
 * Updates an existing contact
 * @param pairHash - pairHash of contact being updated
 * @param update - values to be updated
 */
export async function updateContact(
  pairHash: string,
  update: DBCalls.ContactUpdate,
) {
  await DBCalls.updateContact(pairHash, update);
}

/**
 * Deletes a contact if there are no matching chats in the connections table
 * @param pairHash - pairHash of contact
 * @returns - true if deleted. false if not.
 */
export async function deleteContact(pairHash: string) {
  return await DBCalls.deleteContact(pairHash);
}
