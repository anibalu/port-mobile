import {runSimpleQuery} from './dbCommon';
import {ContactSharingMap} from '@utils/ContactSharing/interfaces';
/**
 * Save a contact sharing entry
 * @param entry An new contact sharing entry to save
 */
export async function newContactSharingEntry(entry: ContactSharingMap) {
  await runSimpleQuery(
    `
    INSERT INTO contactSharing
    (source, destination) VALUES (?, ?) ;'
    `,
    [entry.source, entry.destination],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Get all forwarding requests for a particular lineId
 * @param source a 32 char source identifier
 * @returns
 */
export async function getEntriesForSource(source: string) {
  const matches: Array<ContactSharingMap> = [];
  await runSimpleQuery(
    `
    SELECT source, destination
    FROM contactSharing 
    WHERE source = ? ;
    `,
    [source],
    (tx, results) => {
      for (let i = 0; i < results.rows.length; i++) {
        matches.push(results.rows.item(i));
      }
    },
  );
  return matches;
}

/**
 * Delete a specific contact sharing entry
 * @param entry the entry to delte
 */
export async function deleteContactSharingEntry(entry: ContactSharingMap) {
  await runSimpleQuery(
    `
    DELETE FROM contactSharing
    WHERE source = ? AND destination = ? ;
    '
    `,
    [entry.source, entry.destination],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Run basic contact sharing tests
 * @returns Whether all tests passed
 */
// export async function testContactSharing(): Promise<boolean> {
//   const entry: ContactSharingMap = {
//     source: '12345678901234567890123456789012',
//     destination: 'asdfhalkjsdfhsdhsadskjcbklkjjhfk',
//   };

//   await newContactSharingEntry(entry);
//   const entriesFromDB = await getEntriesForSource(entry.source);
//   if (
//     entriesFromDB.length < 1 ||
//     entriesFromDB[0].source !== entry.source ||
//     entriesFromDB[0].destination !== entry.destination
//   ) {
//     console.log(
//       '[DBCALLS CONTACTSHARING] Failed to find an expected matching entry',
//     );
//     return false;
//   }
//   await deleteContactSharingEntry(entry);
//   if ((await getEntriesForSource(entry.source)).length) {
//     console.log(
//       '[DBCALLS CONTACTSHARING] Found a matching entry when expected none',
//     );
//     return false;
//   }
//   console.log('[DBCALLS CONTACTSHARING] Successfully passed all tests');
//   return true;
// }
