import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * This creates an additional column permissionsId in myPorts table
 */
export async function addPermissionIdToMyPorts() {
  await runSimpleQuery(
    `
          ALTER TABLE myPorts
          ADD COLUMN permissionsId CHAR(32);
          `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully added column permissionsId to myPorts',
      );
    },
  );
}
