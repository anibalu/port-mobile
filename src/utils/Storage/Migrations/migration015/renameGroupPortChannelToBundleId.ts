import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Rename the channel column to bundleId in groupPorts table
 */
export default async function renameGroupPortChannelToBundleId() {
  await runSimpleQuery(
    `
      ALTER TABLE groupPorts
      RENAME COLUMN channel TO bundleId;
  `,
    [],

    (_tx, _results) => {
      console.log(
        '[DB MIGRATION] Successfully renamed the channel column to bundleId in groupPorts table',
      );
    },
  );
}
