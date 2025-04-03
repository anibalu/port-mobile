import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Set up storage for folders
 * - Add color tag column to folders table
 */
export default async function addFolderColorTag() {
  await runSimpleQuery(
    `
      ALTER TABLE folders
      ADD colorTag INT DEFAULT 0;
  `,
    [],

    (_tx, _results) => {
      console.log(
        '[DB MIGRATION] Successfully added the color tag column to folders table',
      );
    },
  );
}
