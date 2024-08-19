import {runSimpleQuery} from './dbCommon';

export interface CryptoData {
  privateKey?: string | null;
  publicKey?: string | null;
  sharedSecret?: string | null;
  peerPublicKeyHash?: string | null;
  rad?: string | null;
}

export interface CryptoDataStrict extends CryptoData {
  privateKey: string;
  publicKey: string;
  sharedSecret: string | null;
  peerPublicKeyHash: string | null;
  rad: string | null;
}

export interface CryptoDataEntry extends CryptoData {
  cryptoId: string;
}

export interface CryptoDataMember extends CryptoData {
  publicKey?: string;
  sharedSecret: string;
}

export interface CryptoDataContactPort extends CryptoData {
  publicKey: string;
  peerPublicKeyHash: string;
  rad: string;
}

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
 * Adds crypto data to storage
 * @param data - crypto data
 */
export async function addCryptoEntry(data: CryptoDataEntry) {
  await runSimpleQuery(
    `
    INSERT INTO cryptoData (
    cryptoId, privateKey, publicKey, sharedSecret, peerPublicKeyHash, rad) VALUES (?,?,?,?,?,?);
    `,
    [
      data.cryptoId,
      data.privateKey,
      data.publicKey,
      data.sharedSecret,
      data.peerPublicKeyHash,
      data.rad,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}

export async function getAllCryptoData(): Promise<CryptoDataEntry[]> {
  const crypto: CryptoDataEntry[] = [];
  await runSimpleQuery('SELECT * FROM cryptoData;', [], (tx, results) => {
    const len = results.rows.length;

    for (let i = 0; i < len; i++) {
      crypto.push(results.rows.item(i));
    }
  });
  return crypto;
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
