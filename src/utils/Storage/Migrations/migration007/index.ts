import {createUnprocessedMessagesTable} from './unprocessedMessagesTable';

export async function migration007() {
  await createUnprocessedMessagesTable();
}
