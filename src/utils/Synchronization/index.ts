import store from '../../store/appStore';

/**
 * Any async block associated with connection fs operations must be wrapped
 * using connectionFsSync in order to make sure that no issues arise from
 * race conditions
 * @param callback
 * @returns propagates the return value of the callback function after calling it
 */
export async function connectionFsSync(callback: () => any) {
  const state = store.getState();
  const connectionFsSyncMutex = state.connectionFsSyncMutex;
  const releaseConnectionFsSyncMutex = await connectionFsSyncMutex.acquire();
  try {
    const returnVal = await callback();
    releaseConnectionFsSyncMutex();
    return returnVal;
  } catch (error) {
    releaseConnectionFsSyncMutex();
    throw error;
  }
}
