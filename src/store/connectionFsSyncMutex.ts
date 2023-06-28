/**
 * A reducer to maintain the mutex for synchronizing async blocks
 * associated with connection operations
 */

import {Mutex} from 'async-mutex';

const initialState = new Mutex();

export default function connectionFsSyncMutex(
  state = initialState,
  action: any, // eslint-disable-line @typescript-eslint/no-unused-vars
) {
  return state;
}
