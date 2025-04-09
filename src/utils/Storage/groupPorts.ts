import * as dbCalls from './DBCalls/ports/groupPorts';
import {UnusedPortData} from './DBCalls/ports/interfaces';

/**
 * Create a new group port entry
 * Add a new group port to the list
 * @param portId a 32 character string identifying a group port
 */
async function newGroupPort(groupId: string, portId: string) {
  await dbCalls.newGroupPort(groupId, portId);
}

/**
 * add new unused group ports to storage.
 * @param groupId
 * @param portIds
 */
export async function newGroupPorts(groupId: string, portIds: string[]) {
  for (let index = 0; index < portIds.length; index++) {
    await newGroupPort(groupId, portIds[index]);
  }
}

/**
 * Update an existing groupPorts
 * @param portId a 32 character identifier for a groupPorts
 * @param update updates to be performed on a groupPorts
 */
export async function updateGroupPortData(
  portId: string,
  update: dbCalls.GroupPortDataUpdate,
) {
  await dbCalls.updateGroupPortData(portId, update);
}

/**
 * A 32 character string identifying a groupPorts
 * to read a groupPorts
 * @param portId a 32 character string identifying a groupPorts
 * @returns information associated with the groupPorts
 */
export async function getGroupPortData(
  portId: string,
): Promise<dbCalls.GroupPortData | null> {
  return await dbCalls.getGroupPortData(portId);
}

/**
 * A get an unused GroupPort
 * @returns information associated with the GroupPort
 */
export async function getUnusedGroupPort(
  groupId: string,
): Promise<UnusedPortData> {
  return await dbCalls.getUnusedGroupPort(groupId);
}

/**
 * Delete a groupPorts entry
 * @param portId a 32 character identifier for a groupPorts
 */
export async function deleteGroupPort(portId: string) {
  await dbCalls.deleteGroupPort(portId);
}
