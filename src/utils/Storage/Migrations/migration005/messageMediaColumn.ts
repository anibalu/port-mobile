import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

export async function messageMediaColumn() {
  await runSimpleQuery(
    `
    ALTER TABLE lineMessages
    ADD COLUMN mediaId ;
    `,
    [],
    () => {
      console.log('[DB MIGRATION] Added mediaId column to lineMessages');
    },
  );

  await runSimpleQuery(
    `
    UPDATE lineMessages
    SET
      mediaId = json_extract(data, '$.mediaId')
    ;
    `,
    [],
    () => {
      console.log('[DB MIGRATION] Extracted mediaIds to new column');
    },
  );
}
