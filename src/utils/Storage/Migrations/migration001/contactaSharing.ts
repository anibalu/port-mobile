import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Created the contact sharing table
 */
export default async function contactSharing() {
  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS contactSharing (
        source CHAR(32) REFERENCES lines(lineId),
        destination CHAR(32) REFERENCES lines(lineId),
        UNIQUE (source, destination)
        ) ;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully added the contactSharing table');
    },
  );
}
