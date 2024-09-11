import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Drops any legacy group tables to allow us to redefine them
 */
export async function clearVestigialGroupTables() {
  await runSimpleQuery(
    `
      DROP TABLE IF EXISTS groupMessages ;
    `,
    [],
    () => {
      console.log(
        '[DB MIGRATION] Successfully dropped vestigial groupMessages',
      );
    },
  );
  await runSimpleQuery(
    `
      DROP TABLE IF EXISTS groupMembers ;
    `,
    [],
    () => {
      console.log(
        '[DB MIGRATION] Successfully dropped vestigial groupMessages',
      );
    },
  );
  await runSimpleQuery(
    `
      DROP TABLE IF EXISTS groups ;
    `,
    [],
    () => {
      console.log(
        '[DB MIGRATION] Successfully dropped vestigial groupMessages',
      );
    },
  );
}
