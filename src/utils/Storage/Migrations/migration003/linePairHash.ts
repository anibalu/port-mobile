import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Add the column pairHash to lines
 */
export async function linePairHash() {
  await runSimpleQuery(
    `
    ALTER TABLE lines
    ADD pairHash VARCHAR(64) ;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully added column pairHash to lines');
    },
  );
}
