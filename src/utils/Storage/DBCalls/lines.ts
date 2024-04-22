import {DEFAULT_NAME} from '@configs/constants';
import {runSimpleQuery} from './dbCommon';
import {
  LineData,
  LineDataEntry,
  LineDataStrict,
} from '@utils/DirectChats/interfaces';

function toBool(a: number | boolean | null | undefined): boolean {
  if (a) {
    return true;
  } else {
    return false;
  }
}

export async function addLine(lineData: LineDataEntry) {
  await runSimpleQuery(
    `
    INSERT INTO lines
    (lineId,
    name ,
    displayPic ,
    authenticated ,
    disconnected ,
    cryptoId ,
    connectedOn ,
    connectedUsing ,
    permissionsId ) VALUES (?,?,?,?,?,?,?,?,?) ;
    `,
    [
      lineData.lineId,
      lineData.name,
      lineData.displayPic,
      lineData.authenticated,
      lineData.disconnected,
      lineData.cryptoId,
      lineData.connectedOn,
      lineData.connectedUsing,
      lineData.permissionsId,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

export async function getLines(): Promise<LineDataEntry[]> {
  const lines: LineDataEntry[] = [];
  await runSimpleQuery('SELECT * FROM lines;', [], (tx, results) => {
    const len = results.rows.length;
    let entry;
    for (let i = 0; i < len; i++) {
      entry = results.rows.item(i);
      entry.authenticated = toBool(entry.authenticated);
      entry.disconnected = toBool(entry.disconnected);
      lines.push(results.rows.item(i));
    }
  });
  return lines;
}

/**
 * Save a new, unauthenticated line
 * @param lineId a 32 character lineId
 */
export async function newLine(lineId: string) {
  await runSimpleQuery(
    `
    INSERT INTO lines
    (lineId, authenticated) VALUES (?, FALSE) ;
    `,
    [lineId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Read data for a given line
 * @param lineId a 32 char lineId
 * @returns
 */
export async function readLineData(
  lineId: string,
): Promise<LineDataStrict | null> {
  let match: LineDataStrict | null = null;
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
        if (!newMatch.name) {
          newMatch.name = DEFAULT_NAME;
        }
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
export async function updateLine(lineId: string, update: LineData) {
  await runSimpleQuery(
    `
    UPDATE lines
    SET
    name = COALESCE(?, name), 
    displayPic = COALESCE(?, displayPic), 
    authenticated = COALESCE(?, authenticated), 
    disconnected = COALESCE(?, disconnected),
    cryptoId = COALESCE(?, cryptoId),
    connectedOn = COALESCE(?, connectedOn),
    connectedUsing = COALESCE(? , connectedUsing),
    permissionsId = COALESCE(? , permissionsId),
    pairHash = COALESCE(pairHash, ?)
    WHERE lineId = ? ;
    `,
    [
      update.name,
      update.displayPic,
      update.authenticated,
      update.disconnected,
      update.cryptoId,
      update.connectedOn,
      update.connectedUsing,
      update.permissionsId,
      update.pairHash,
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
export async function getUnauthenticatedLines(): Promise<
  Array<LineDataStrict>
> {
  const matches: Array<LineDataStrict> = [];
  await runSimpleQuery(
    `
    SELECT *
    FROM lines
    WHERE authenticated = FALSE ;
    `,
    [],
    (tx, results) => {
      for (let i = 0; i < results.rows.length; i++) {
        const newMatch: LineData = results.rows.item(i);
        newMatch.authenticated = toBool(newMatch.authenticated);
        newMatch.disconnected = toBool(newMatch.disconnected);
        matches.push(newMatch as LineDataStrict);
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

// export async function testLineInfo(): Promise<boolean> {
//   const id = '12345678901234567890123456789012';
//   const authenticated = true;
//   const name = 'A TEST LINE NAME';
//   await newLine(id);
//   if ((await getUnauthenticatedLines()).length < 1) {
//     console.log(
//       '[DBCALLS LINES] Expected an unauthenticated line but found none',
//     );
//     return false;
//   }

//   await updateLine(id, {name, authenticated});
//   if ((await getUnauthenticatedLines()).length) {
//     console.log(
//       '[DBCALLS LINES] Got an unauthenticated line when we expected none',
//       await getUnauthenticatedLines(),
//     );
//     return false;
//   }

//   if ((await readLineData(id)).name !== name) {
//     console.log('[DBCALLS LINES] Name was not set correctly');
//     return false;
//   }

//   await deleteLine(id);
//   if ((await readLineData(id)).name) {
//     console.log('[DBCALLS LINES] Found a deleted line');
//     return false;
//   }
//   console.log('[DBCALLS LINES] Successfully passed all tests');
//   return true;
// }
