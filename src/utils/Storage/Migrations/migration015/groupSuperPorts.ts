import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

export default async function groupSuperports() {
  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS groupSuperPorts (
      portId CHAR(32) PRIMARY KEY,
      groupId CHAR(32),
      version VARCHAR(16),
      bundleId VARCHAR(128),
      paused BOOL,
      FOREIGN KEY (groupId) REFERENCES groups(groupId)
    ) ;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully added the groupSuperports table',
      );
    },
  );
}
