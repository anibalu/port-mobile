import {UnusedPortData} from './DBCalls/ports/interfaces';
import * as dbCalls from './DBCalls/ports/myPorts';

/**
 * Save a new unused port Id
 * @param portId
 */
async function newPort(portId: string) {
  await dbCalls.newPort(portId);
}

/**
 * Save an array of unused port Ids.
 * @param portIds
 */
export async function newPorts(portIds: string[]) {
  for (let index = 0; index < portIds.length; index++) {
    await newPort(portIds[index]);
  }
}

/**
 * Fetch an unused port from storage.
 * @returns - an unused port if it exists
 */
export async function getUnusedPort(): Promise<UnusedPortData> {
  return await dbCalls.getUnusedPort();
}

/**
 * Update an existing port
 * @param portId a 32 character identifier for a port
 * @param update updates to be performed on a port
 */
export async function updatePortData(
  portId: string,
  update: dbCalls.PortDataUpdate,
) {
  await dbCalls.updatePortData(portId, update);
}

/**
 * A 32 character string identifying a port
 * to read a port
 * @param portId a 32 character string identifying a port
 * @returns information associated with the port
 */
export async function getPortData(
  portId: string,
): Promise<dbCalls.PortData | null> {
  return await dbCalls.getPortData(portId);
}

/**
 * Returns all generated ports
 * @returns all ports which have been used.
 */
export async function getUsedPorts(): Promise<dbCalls.PortData[]> {
  return await dbCalls.getUsedPorts();
}

/**
 * Delete a port entry
 * @param portId a 32 character identifier for a port
 */
export async function deletePortData(portId: string) {
  await dbCalls.deletePortData(portId);
}
