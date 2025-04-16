import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Add the permissionsId column to contactPorts table
 */
export async function addPermissionsIdToContactPorts() {
  await runSimpleQuery(
    `
          ALTER TABLE contactPorts
          ADD COLUMN permissionsId CHAR(32);
          `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully added column permissionsId to contact ports',
      );
    },
  );
}
