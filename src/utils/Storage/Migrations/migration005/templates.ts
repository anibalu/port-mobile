import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

export default async function templates() {
  await runSimpleQuery(
    `
      CREATE TABLE IF NOT EXISTS templates (
        templateId CHAR(32) PRIMARY KEY,
        title  VARCHAR(64),
        template VARCHAR(2048)
      );
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully added the templates table');
    },
  );
}
