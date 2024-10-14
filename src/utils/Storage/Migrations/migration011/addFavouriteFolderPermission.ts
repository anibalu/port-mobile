import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';
import {getAllFolders} from '@utils/Storage/folders';

/**
 * Set up storage for permissions
 * - Add favourite folder column to permissions table
 * - Update folder permission of default folder
 */
export default async function addFavouriteFolderPermission() {
  await runSimpleQuery(
    `
      ALTER TABLE permissions
      ADD favourite BOOL DEFAULT true;
  `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully added the favourite folder column to permissions table',
      );
    },
  );

  const folders = await getAllFolders();
  for (let index = 0; index < folders.length; index++) {
    // update folder permission of default folder
    await runSimpleQuery(
      `
    UPDATE permissions
    SET
    favourite = COALESCE(?, favourite)
    WHERE permissionsId = ? ;
    `,
      [true, folders[index].folderId],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (tx, results) => {
        console.log(
          "Successfully changed all folders' favourite permission to true",
        );
      },
    );
  }
}
