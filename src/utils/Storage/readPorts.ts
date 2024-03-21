import {ReadPortData} from '@utils/Ports/interfaces';
import * as dbCalls from './DBCalls/readPorts';

/**
 * Create a new readPorts entry
 * Add a new readPorts to the list
 * @param newPort the newly scanned port to save
 */
export async function newReadPort(newPort: ReadPortData) {
  await dbCalls.newReadPort(newPort);
}

/**
 * Read all readPorts
 * @returns information associated with the port
 */
export async function getReadPorts(): Promise<Array<ReadPortData>> {
  return await dbCalls.getReadPorts();
}

/**
 * A 32 character string identifying a port
 * to read a port
 * @param portId a 32 character string identifying a port
 * @returns information associated with the port
 */
export async function getReadPortData(
  portId: string,
): Promise<ReadPortData | null> {
  return await dbCalls.getReadPortData(portId);
}

/**
 * expire a read port
 * @param portId a 32 character identifier for a read port
 */
export async function expireReadPort(portId: string) {
  await dbCalls.expireReadPort(portId);
}

/**
 * Delete a readPorts entry
 * @param portId a 32 character identifier for a readPorts
 */
export async function deleteReadPortData(portId: string) {
  await dbCalls.deleteReadPortData(portId);
}
