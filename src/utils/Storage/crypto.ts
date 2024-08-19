import * as dbCalls from './DBCalls/crypto';

/**
 * Add a new cryptoData entry with no other columns set
 * @param id a 32 character string representing the id
 */
export async function newCryptoEntry(id: string) {
  await dbCalls.newCryptoEntry(id);
}

/**
 * Adds crypto data to storage
 * @param data - crypto data
 */
export async function addCryptoEntry(data: dbCalls.CryptoDataEntry) {
  await dbCalls.addCryptoEntry(data);
}

export async function getAllCryptoData(): Promise<dbCalls.CryptoDataEntry[]> {
  return await dbCalls.getAllCryptoData();
}

/**
 * Get crypto information associated with an id
 * @param id a 32 character string representing an entry
 * @returns record matching the entry for id
 */
export async function getCryptoData(id: string): Promise<dbCalls.CryptoData> {
  return await dbCalls.getCryptoData(id);
}

/**
 * Update a crypto entry
 * @param id a 32 character string representing an entry
 * @param update The udpate to an entry
 */
export async function updateCryptoData(id: string, update: dbCalls.CryptoData) {
  await dbCalls.updateCryptoData(id, update);
}

/**
 * Delete a crypto entry
 * @param id a 32 character string representing an entry
 */
export async function deleteCryptoData(id: string) {
  await dbCalls.deleteCryptoData(id);
}
