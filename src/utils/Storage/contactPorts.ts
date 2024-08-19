import * as dbCalls from './DBCalls/ports/contactPorts';

/**
 * Adds a new active ticket to contact port tickets
 * @param data
 */
export async function addContactPortTicket(data: dbCalls.ContactPortTicket) {
  await dbCalls.addContactPortTicket(data);
}

/**
 * Toggles an existing ticket as inactive.
 * @param ticketId
 * @param contactPortId
 */
export async function toggleTicketInactive(
  contactPortId: string,
  ticketId: string,
) {
  await dbCalls.toggleTicketInactive(contactPortId, ticketId);
}

/**
 * Get a matching contact port ticket from storage
 * @param contactPortId
 * @param ticketId
 * @returns - contact port ticket if one is found
 */
export async function getContactPortTicket(
  contactPortId: string,
  ticketId: string,
): Promise<dbCalls.ContactPortTicket | null> {
  return await dbCalls.getContactPortTicket(contactPortId, ticketId);
}

/**
 * Create a new contact port entry
 * @param data - data associated with the contact port.
 */
export async function addContactPort(data: dbCalls.ContactPortData) {
  await dbCalls.addContactPort(data);
}

/**
 * Create new accepted contact port entry
 * @param data - data read from shared contact port.
 */
export async function acceptContactPort(data: dbCalls.AcceptedContactPortData) {
  await dbCalls.acceptContactPort(data);
}

/**
 * Update a contact port's data. only update allowed data is changed.
 * @param data - data being updated
 */
export async function updateContactPortData(
  portId: string,
  data: dbCalls.ContactPortDataUpdate,
) {
  await dbCalls.updateContactPortData(portId, data);
}

/**
 * Get a created contact port for a particular chat
 * @param pairHash - pairHash associated with the chat
 * @returns - contact port data.
 */
export async function getContactPortDataFromPairHash(
  pairHash: string,
): Promise<dbCalls.ContactPortData | null> {
  return await dbCalls.getContactPortDataFromPairHash(pairHash);
}

/**
 * Get a accepted contact port for a particular chat
 * @param pairHash - pairHash associated with the chat
 * @returns - accepted contact port data.
 */
export async function getAcceptedContactPortDataFromPairHash(
  pairHash: string,
): Promise<dbCalls.AcceptedContactPortData | null> {
  return await dbCalls.getAcceptedContactPortDataFromPairHash(pairHash);
}

/**
 * Get a created contact port
 * @param contactPortId
 * @returns - contact port data.
 */
export async function getContactPortData(
  contactPortId: string,
): Promise<dbCalls.ContactPortData | null> {
  return await dbCalls.getContactPortData(contactPortId);
}

/**
 * Get an accepted contact port
 * @param contactPortId
 * @returns - contact port data.
 */
export async function getAcceptedContactPortData(
  contactPortId: string,
): Promise<dbCalls.AcceptedContactPortData | null> {
  return await dbCalls.getAcceptedContactPortData(contactPortId);
}

/**
 * increments connections made using contact port by 1
 * @param portId
 */
export async function incrementConnectionsMade(
  portId: string,
  usedOnTimestamp: string,
) {
  await dbCalls.incrementConnectionsMade(portId, usedOnTimestamp);
}

/**
 * Delete a generated or accepted contact port entry
 * @param portId a 32 character identifier for a contact
 */
export async function deleteContactPortData(portId: string) {
  await dbCalls.deleteContactPortData(portId);
}

/**
 * Delete the contact port entries for a line
 * (deletes both accepted and generated contact ports)
 * @param pairHash a 64 character identifier for a contact
 */
export async function deleteContactPortsAssociatedWithContact(
  pairHash: string,
) {
  await dbCalls.deleteContactPortsAssociatedWithContact(pairHash);
}

/**
 * Get all created and accepted contact port
 * @returns - contact ports
 */
export async function getAllContactPorts(): Promise<
  (dbCalls.ContactPortData | dbCalls.AcceptedContactPortData)[]
> {
  return await dbCalls.getAllContactPorts();
}
