import {runSimpleQuery, toBool} from './dbCommon';

export interface LineDataUpdate {
  authenticated?: boolean | null;
  disconnected?: boolean | null;
  cryptoId?: string | null;
  permissionsId?: string | null;
}

export interface LineData extends LineDataUpdate {
  authenticated: boolean;
  disconnected: boolean;
  cryptoId: string;
  permissionsId: string;
}

export interface LineDataEntry extends LineData {
  lineId: string;
}

/**
 * Add a new entry to the lines storage
 * @param lineData - attributes of the line
 */
export async function addLine(lineData: LineDataEntry) {
  await runSimpleQuery(
    `
    INSERT INTO lines (
    lineId,
    authenticated,
    disconnected,
    cryptoId,
    permissionsId 
    ) VALUES (?,?,?,?,?) ;
    `,
    [
      lineData.lineId,
      lineData.authenticated,
      lineData.disconnected,
      lineData.cryptoId,
      lineData.permissionsId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Get a list of lines and their attributes
 * @returns - all lines
 */
export async function getLines(): Promise<LineDataEntry[]> {
  const lines: LineDataEntry[] = [];
  await runSimpleQuery('SELECT * FROM lines;', [], (tx, results) => {
    const len = results.rows.length;
    let entry;
    for (let i = 0; i < len; i++) {
      entry = results.rows.item(i);
      entry.authenticated = toBool(entry.authenticated);
      entry.disconnected = toBool(entry.disconnected);
      lines.push(entry);
    }
  });
  return lines;
}

/**
 * Read data for a given line
 * @param lineId a 32 char lineId
 * @returns
 */
export async function getLineData(
  lineId: string,
): Promise<LineDataEntry | null> {
  let match: LineDataEntry | null = null;
  await runSimpleQuery(
    `
    SELECT *
    FROM lines
    WHERE lineId = ? ;
    `,
    [lineId],
    (tx, results) => {
      if (results.rows.length > 0) {
        const newMatch = results.rows.item(0);
        newMatch.authenticated = toBool(newMatch.authenticated);
        newMatch.disconnected = toBool(newMatch.disconnected);
        match = newMatch;
      }
    },
  );
  return match;
}

/**
 * Update a line's data
 * @param lineId a 32 char lineId
 * @param update changes to be applied to the line
 */
export async function updateLine(lineId: string, update: LineDataUpdate) {
  await runSimpleQuery(
    `
    UPDATE lines
    SET
    authenticated = COALESCE(?, authenticated), 
    disconnected = COALESCE(?, disconnected),
    cryptoId = COALESCE(?, cryptoId),
    permissionsId = COALESCE(? , permissionsId)
    WHERE lineId = ? ;
    `,
    [
      update.authenticated,
      update.disconnected,
      update.cryptoId,
      update.permissionsId,
      lineId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Get all saved yet unauthenticated lines
 * @returns list of all unauthenticated lines
 */
export async function getUnauthenticatedLines(): Promise<LineDataEntry[]> {
  const matches: LineDataEntry[] = [];
  await runSimpleQuery(
    `
    SELECT *
    FROM lines
    WHERE authenticated = FALSE ;
    `,
    [],
    (tx, results) => {
      for (let i = 0; i < results.rows.length; i++) {
        const newMatch = results.rows.item(i);
        newMatch.authenticated = toBool(newMatch.authenticated);
        newMatch.disconnected = toBool(newMatch.disconnected);
        matches.push(newMatch);
      }
    },
  );
  return matches;
}

/**
 * Delete a line entry
 * @param lineId a 32 character lineId
 */
export async function deleteLine(lineId: string) {
  await runSimpleQuery(
    `
    DELETE FROM lines
    WHERE lineId = ? ;
    `,
    [lineId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}
