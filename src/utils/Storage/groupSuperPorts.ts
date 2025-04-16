import * as dbCalls from './DBCalls/ports/groupSuperPorts';

/**
 * Create a new group superport entry
 * @param data - data associated with the group superport.
 */
export async function addGroupSuperport(data: dbCalls.GroupSuperportData) {
  await dbCalls.addGroupSuperport(data);
}

/**
 * Update an existing group super port
 * @param portId a 32 character identifier for a group super port
 * @param update updates to be performed on a group super port
 */
export async function updateGroupSuperportData(
  portId: string,
  update: dbCalls.GroupSuperportDataUpdate,
) {
  await dbCalls.updateGroupSuperportData(portId, update);
}

/**
 * Get the group superport associated with a group.
 * @param groupId a 32 character string identifying a group.
 * @returns information associated with the group superport if one exists.
 */
export async function getGroupSuperportDataFromGroupId(
  groupId: string,
): Promise<dbCalls.GroupSuperportData | null> {
  return await dbCalls.getGroupSuperportDataFromGroupId(groupId);
}

/**
 * Get the group superport associated with a portId.
 * @param portId a 32 character string identifying a group superport.
 * @returns information associated with the group superport if one exists.
 */
export async function getGroupSuperportData(
  portId: string,
): Promise<dbCalls.GroupSuperportData | null> {
  return await dbCalls.getGroupSuperportData(portId);
}

/**
 * Delete a group superport entry
 * @param portId a 32 character identifier for a group superport
 */
export async function deleteGroupSuperPortData(portId: string) {
  await dbCalls.deleteGroupSuperPortData(portId);
}

/**
 * Pause a group superport
 */
export async function pauseGroupSuperport(portId: string) {
  await dbCalls.updateGroupSuperportData(portId, {paused: true});
}

/**
 * unpause a group superport
 */
export async function unpauseGroupSuperport(portId: string) {
  await dbCalls.updateGroupSuperportData(portId, {paused: false});
}
