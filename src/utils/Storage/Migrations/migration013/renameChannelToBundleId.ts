import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Rename the channel column to bundleId in myPorts table
 */
export async function renamePortChannelToBundleId() {
  await runSimpleQuery(
    `
      ALTER TABLE myPorts
      RENAME COLUMN channel TO bundleId;
  `,
    [],

    (_tx, _results) => {
      console.log(
        '[DB MIGRATION] Successfully renamed the channel column to bundleId in myPorts table',
      );
    },
  );
}

/**
 * Rename the channel column to bundleId in superPorts table
 */
export async function renameSuperPortChannelToBundleId() {
  await runSimpleQuery(
    `
      ALTER TABLE superPorts
      RENAME COLUMN channel TO bundleId;
  `,
    [],

    (_tx, _results) => {
      console.log(
        '[DB MIGRATION] Successfully renamed the channel column to bundleId in superPorts table',
      );
    },
  );
}
