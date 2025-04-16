import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Add the permissionsId column to readPorts table
 */
export async function addPermissionsIdToReadPorts() {
  await runSimpleQuery(
    `
          ALTER TABLE readPorts
          ADD COLUMN permissionsId CHAR(32);
          `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully added column permissionsId to read ports',
      );
    },
  );
}
