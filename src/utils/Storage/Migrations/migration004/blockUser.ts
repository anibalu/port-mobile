import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

export default async function blockedUsers() {
  await runSimpleQuery(
    `
  CREATE TABLE IF NOT EXISTS blockedUsers (
    pairHash VARCHAR(64) PRIMARY KEY,
    name VARCHAR(64),
    blockTimestamp VARCHAR(27)
);
  `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully added the blockedUsers table');
    },
  );
}
