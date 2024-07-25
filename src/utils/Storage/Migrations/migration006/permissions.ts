import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Set up storage for permissions
 * - Add focus column to permissions table
 */
export default async function permissionsFocus() {
  await runSimpleQuery(
    `
      ALTER TABLE permissions
      ADD focus BOOL DEFAULT false;
  `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully added the focus column to permissions table',
      );
    },
  );
}
