import {runSimpleQuery} from './dbCommon';
import {CryptoData} from '@utils/Crypto/interfaces';

/**
 * Add a new cryptoData entry with no other columns set
 * @param id a 32 character string representing the id
 */
export async function newCryptoEntry(id: string) {
  await runSimpleQuery(
    `
    INSERT INTO cryptoData
    (cryptoId) VALUES (?);
    `,
    [id],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Get crypto information associated with an id
 * @param id a 32 character string representing an entry
 * @returns record matching the entry for id
 */
export async function getCryptoData(id: string): Promise<CryptoData> {
  let matchingEntry = {};
  await runSimpleQuery(
    `
    SELECT privateKey, publicKey, sharedSecret, peerPublicKeyHash, rad
    FROM cryptoData
    WHERE cryptoId = ?;
    `,
    [id],

    (tx, results) => {
      if (results.rows.length > 0) {
        matchingEntry = results.rows.item(0);
      }
    },
  );
  return matchingEntry;
}

/**
 * Update a crypto entry
 * @param id a 32 character string representing an entry
 * @param update The udpate to an entry
 */
export async function updateCryptoData(id: string, update: CryptoData) {
  await runSimpleQuery(
    `
    UPDATE cryptoData
    SET
    privateKey = COALESCE(?, privateKey),
    publicKey = COALESCE(?, publicKey),
    sharedSecret = COALESCE(?, sharedSecret),
    peerPublicKeyHash = COALESCE(?, peerPublicKeyHash),
    rad = COALESCE(?, rad)
    WHERE cryptoId = ? ;
    `,
    [
      update.privateKey,
      update.publicKey,
      update.sharedSecret,
      update.peerPublicKeyHash,
      update.rad,
      id,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Delete a crypto entry
 * @param id a 32 character string representing an entry
 */
export async function deleteCryptoData(id: string) {
  await runSimpleQuery(
    `
    DELETE FROM cryptoData
    WHERE cryptoId = ? ;
    `,
    [id],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

/**
 * Test cases for cryptoData CRUD operations
 * @returns whether the tests pass
 */
// export async function testCryptoData(): Promise<boolean> {
//   const id: string = '12345678901234567890123456789012';
//   const privateKey: string = id + id;
//   await newCryptoEntry(id);
//   if ((await getCryptoData(id)).privateKey) {
//     return false;
//   }
//   await updateCryptoData(id, {privateKey});
//   if ((await getCryptoData(id)).privateKey !== privateKey) {
//     return false;
//   }
//   await deleteCryptoData(id);
//   if ((await getCryptoData(id)).privateKey) {
//     return false;
//   }
//   console.log('[DBCALLS CRYPTO] Passed all tests');
//   return true;
// }
