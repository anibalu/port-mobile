import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

export async function createGroupsTable() {
  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS groups (
      groupId CHAR(32) PRIMARY KEY,
      name VARCHAR(64),
      joinedAt VARCHAR(27),
      description VARCHAR(256),
      groupPicture VARCHAR(128),
      amAdmin BOOL,
      disconnected BOOL,
      selfCryptoId CHAR(32),
      permissionsId CHAR(32),
      groupPictureKey CHAR(64),
      initialMemberInfoReceived BOOL,
      FOREIGN KEY (permissionsId) REFERENCES permissions(permissionsId)
    ) ;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully added the groups table');
    },
  );
}
