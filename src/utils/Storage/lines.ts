import * as DBCalls from './DBCalls/lines';

/**
 * Save a new line with its attributes
 * @param lineData attributes associated with line
 */
export async function addLine(lineData: DBCalls.LineDataEntry) {
  await DBCalls.addLine(lineData);
}

/**
 * Get a list of lines and their attributes
 * @returns - all lines
 */
export async function getLines(): Promise<DBCalls.LineDataEntry[]> {
  return await DBCalls.getLines();
}

/**
 * Check if a line exists
 * @param {string} lineId - lineId of direct chat
 * @returns - boolean indicating existence of line
 */
export async function checkLineExists(lineId: string) {
  const line = await DBCalls.getLineData(lineId);
  if (line) {
    return true;
  }
  return false;
}

/**
 * Read data for a given line
 * @param lineId a 32 char lineId
 * @returns
 */
export async function readLineData(
  lineId: string,
): Promise<DBCalls.LineDataEntry> {
  const lineData = await DBCalls.getLineData(lineId);
  if (!lineData) {
    throw new Error('No such line');
  }
  return lineData;
}
export async function getLineData(
  lineId: string,
): Promise<DBCalls.LineDataEntry | null> {
  return await DBCalls.getLineData(lineId);
}

/**
 * Update a line's data
 * @param lineId a 32 char lineId
 * @param update changes to be applied to the line
 */
export async function updateLine(
  lineId: string,
  update: DBCalls.LineDataUpdate,
) {
  await DBCalls.updateLine(lineId, update);
}

/**
 * Get all saved yet unauthenticated lines
 * @returns list of all unauthenticated lines
 */
export async function getUnauthenticatedLines(): Promise<
  DBCalls.LineDataEntry[]
> {
  return await DBCalls.getUnauthenticatedLines();
}

/**
 * Delete a line entry
 * @param lineId a 32 character lineId
 */
export async function deleteLine(lineId: string) {
  await DBCalls.deleteLine(lineId);
}
