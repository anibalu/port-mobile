import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Add the permissionsId column to superPorts table
 */
export async function addPermissionIdToSuperPorts() {
  await runSimpleQuery(
    `
          ALTER TABLE superPorts
          ADD COLUMN permissionsId CHAR(32);
          `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully added column permissionsId to superPorts',
      );
    },
  );
}
