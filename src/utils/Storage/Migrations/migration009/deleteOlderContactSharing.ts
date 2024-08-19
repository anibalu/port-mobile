import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Deleted the deprecated contact sharing table
 */
export default async function deleteOlderContactSharing() {
  await runSimpleQuery(
    `
    DROP TABLE contactSharing;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully deleted the contactSharing table',
      );
    },
  );
}
