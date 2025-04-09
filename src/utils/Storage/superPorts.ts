import * as dbCalls from './DBCalls/ports/superPorts';
import {SuperportData,SuperportDataUpdate} from './DBCalls/ports/superPorts';
/**
 * Create a new super port entry
 * Add a new super port to the list
 * @param portId a 32 character string identifying a port
 */
export async function newSuperport(portId: string) {
  await dbCalls.newSuperport(portId);
}

/**
 * Create a new superport entry
 * @param data - data associated with the superport.
 */
export async function addSuperport(data: SuperportData) {
  await dbCalls.addSuperport(data);
}

/**
 * Update an existing super port
 * @param portId a 32 character identifier for a super port
 * @param update updates to be performed on a super port
 */
export async function updateSuperportData(
  portId: string,
  update: SuperportDataUpdate,
) {
  await dbCalls.updateSuperportData(portId, update);
}

/**
 * A 32 character string identifying a superport
 * to read a superport
 * @param portId a 32 character string identifying a superport
 * @returns information associated with the superport
 */
export async function getSuperportData(
  portId: string,
): Promise<SuperportData | null> {
  return await dbCalls.getSuperportData(portId);
}

/**
 * Get all superports
 * @returns information associated with the superport
 */
export async function getAllSuperports(): Promise<SuperportData[]> {
  return await dbCalls.getAllSuperports();
}

/**
 * increments connections made using superport by 1
 * @param portId
 */
export async function incrementConnectionsMade(
  portId: string,
  usedOnTimestamp: string,
) {
  await dbCalls.incrementConnectionsMade(portId, usedOnTimestamp);
}

/**
 * Delete a superport entry
 * @param portId a 32 character identifier for a superport
 */
export async function deleteSuperPortData(portId: string) {
  await dbCalls.deleteSuperPortData(portId);
}

/**
 * Pause a superport
 */
export async function pauseSuperport(portId: string) {
  await dbCalls.updateSuperportData(portId, {paused: true});
}

/**
 * unpause a superport
 */
export async function unpauseSuperport(portId: string) {
  await dbCalls.updateSuperportData(portId, {paused: false});
}
