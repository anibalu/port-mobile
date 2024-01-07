import {LineData, LineDataStrict} from '@utils/DirectChats/interfaces';
import * as dbCalls from './DBCalls/lines';

/**
 * Save a new, unauthenticated line
 * @param lineId a 32 character lineId
 */
export async function newLine(lineId: string) {
  await dbCalls.newLine(lineId);
}

/**
 * Read data for a given line
 * @param lineId a 32 char lineId
 * @returns
 */
export async function readLineData(
  lineId: string,
): Promise<LineDataStrict | null> {
  return await dbCalls.readLineData(lineId);
}

/**
 * Update a line's data
 * @param lineId a 32 char lineId
 * @param update changes to be applied to the line
 */
export async function updateLine(lineId: string, update: LineData) {
  await dbCalls.updateLine(lineId, update);
}

/**
 * Get all saved yet unauthenticated lines
 * @returns list of all unauthenticated lines
 */
export async function getUnauthenticatedLines(): Promise<
  Array<LineDataStrict>
> {
  return await dbCalls.getUnauthenticatedLines();
}

/**
 * Delete a line entry
 * @param lineId a 32 character lineId
 */
export async function deleteLine(lineId: string) {
  await dbCalls.deleteLine(lineId);
}
