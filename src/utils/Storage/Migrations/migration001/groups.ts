import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Set up storage for groupos
 * - Create the groups table
 * - Create the groupMembers table
 * - Create an index to get members of a given group more easily
 */
export default async function groups() {
  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS groups (
      groupId CHAR(32) PRIMARY KEY,
      name VARCHAR(64),
      joinedAt VARCHAR(27),
      description VARCHAR(256),
      groupPicture VARCHAR(128),
      amAdmin BOOL
    ) ;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully added the groups table');
    },
  );

  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS groupMembers (
      groupId CHAR(32),
      name VARCHAR(64),
      memberId CHAR(32),
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
