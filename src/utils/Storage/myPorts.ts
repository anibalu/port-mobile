import {
  PortData,
  PortDataUpdate,
  UnusedPortData,
} from '@utils/Ports/interfaces';
import * as dbCalls from './DBCalls/myPorts';

export async function newPort(portId: string) {
  await dbCalls.newPort(portId);
}

export async function newPorts(portIds: string[]) {
  for (let index = 0; index < portIds.length; index++) {
    await newPort(portIds[index]);
  }
}

export async function getUnusedPort(): Promise<UnusedPortData> {
  return await dbCalls.getUnusedPort();
}

/**
 * Update an existing port
 * @param portId a 32 character identifier for a port
 * @param update updates to be performed on a port
 */
export async function updatePortData(portId: string, update: PortDataUpdate) {
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
): Promise<PortDataUpdate | null> {
  return await dbCalls.getPortData(portId);
}

/**
 * Returns all generated ports
 * @returns all ports which have been used.
 */
export async function getUsedPorts(): Promise<PortData[]> {
  return await dbCalls.getUsedPorts();
}

/**
 * Delete a port entry
 * @param portId a 32 character identifier for a port
 */
export async function deletePortData(portId: string) {
  await dbCalls.deletePortData(portId);
}
