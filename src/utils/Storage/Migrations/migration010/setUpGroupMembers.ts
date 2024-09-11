import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

export async function setUpGroupMembers() {
  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS groupMembers (
      groupId CHAR(32),
      memberId CHAR(32),
      pairHash CHAR(64),
      joinedAt VARCHAR(27),
      cryptoId CHAR(32) REFERENCES cryptoData(cryptoId),
      isAdmin BOOL,
      deleted BOOL,
      FOREIGN KEY (groupId) REFERENCES groups(groupId),
      UNIQUE(groupId, memberId)
    ) ;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully added the groupMembers table');
    },
  );

  await runSimpleQuery(
    `
    CREATE INDEX IF NOT EXISTS group_members ON
    groupMembers(groupId) ;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully created an index on group members by group',
      );
    },
  );
}
