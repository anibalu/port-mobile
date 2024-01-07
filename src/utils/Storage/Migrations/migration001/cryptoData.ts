import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Set up the cryptoData table
 */
export default async function cryptoData() {
  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS cryptoData (
      cryptoId CHAR(32) PRIMARY KEY,
      privateKey CHAR(64),
      publicKey CHAR(64),
      sharedSecret CHAR(64),
      peerPublicKeyHash CHAR(64),
      rad CHAR(32)
      );
    )
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully added the crypto table');
    },
  );
}
