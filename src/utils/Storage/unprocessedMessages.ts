import {getAndClearUnprocessedMessages} from './DBCalls/unprocessedMessages';

/**
 * returns a list of potentially unprocessed, cached messages
 * that are added to the cache by the NSE on iOS. These are meant
 * to be processed in conjunction with a fetch from the backend
 * to speed up the process.
 * @returns cached messages
 */
export async function getUnprocessedMessages() {
  return await getAndClearUnprocessedMessages();
}
