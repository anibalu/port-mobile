import {MessageStatus} from '@utils/Messaging/interfaces';
import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * delete ALL unsent messages
 * This is important to patch the contact sharing issue.
 */
export async function deleteUnsent() {
  await runSimpleQuery(
    `
      DELETE FROM lineMessages 
      WHERE messageStatus = ? ;
      `,
    [MessageStatus.journaled],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {},
  );
}
