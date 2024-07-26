import {runSimpleQuery} from './dbCommon';

/**
 * Return any messages cached locally by the NSE that may
 * or may not have been processed yet. Upon returning the messages,
 * this function also clears the entire cache.
 * @returns all messages cached on iOS from the NSE
 */
export async function getAndClearUnprocessedMessages() {
  const messages: string[] = [];
  // Get all the unprocessed messages
  await runSimpleQuery(
    `
      SELECT unprocessedMessage
      FROM unprocessedMessages ;
    `,
    [],
    (tx, results) => {
      for (let i = 0; i < results.rows.length; i++) {
        messages.push(results.rows.item(i).unprocessedMessage);
      }
    },
  );
  // Clear all the unprocessed messages
  /**
   * It's okay that this is not concurrency safe or atomic
   * since the local cache is purely a lower latency fetch
   * than the backlog fetch API call that will run anyway
   */
  await runSimpleQuery('DELETE FROM unprocessedMessages ;', [], () => {});
  return messages;
}
