import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Set up storage for permissions
 * - Add Calling permission column to permissions table
 */
export default async function addCallingPermission() {
  await runSimpleQuery(
    `
      ALTER TABLE permissions
      ADD calling BOOL DEFAULT true;
  `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully added the calling permission column to permissions table',
      );
    },
  );
}
