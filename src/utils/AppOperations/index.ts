import {debounce} from 'lodash';

import store from '@store/appStore';

import pullBacklog from '@utils/Messaging/pullBacklog';
import sendJournaled from '@utils/Messaging/Send/sendJournaled';
import {cancelAllNotifications} from '@utils/Notifications';
import {cleanUpPorts, processReadBundles} from '@utils/Ports';
import {deleteExpiredGroupMessages} from '@utils/Storage/groupMessages';
import {deleteExpiredMessages} from '@utils/Storage/messages';
import {checkForUpdates} from '@utils/TermsAndConditions';

async function commonAppOperations(): Promise<void> {
  /**
   * We collect the promises of all the asynchronous processes
   * and wait for them all to resolve/reject before we proceed.
   *
   * In the event that one of the promises are rejected, we still
   * want to wait for the others to try and complere. This is why we
   * catch any and all rejections and resolve them
   */
  const operationPromises: Promise<any>[] = [
    pullBacklog(), // Get messages sent to me
    sendJournaled(), // Send messages still waiting for network
    cleanUpPorts(), // Clean up ports that are expired
    processReadBundles(), // Process any connections made while offline
    deleteExpiredGroupMessages(), // Delete disappearing messages on groups
    deleteExpiredMessages(), // Delete disappearing messages on lines
  ];
  await Promise.allSettled(operationPromises);
}

/**
 * All actions that need to be performed when the app goes from foreground to background
 */
export async function backgroundToForegroundOperations() {
  console.log('[BTF OPERATIONS] RUNNING');
  // Ping to redraw as needed
  store.dispatch({
    type: 'PING',
    payload: 'PONG',
  });
  cancelAllNotifications(); // Intentionlly skip awaiting since the operations are distinct
  await commonAppOperations();
  await checkForUpdates(); // Not a common operation, only run when the user foregrounds the app since
  // that's when we can offer up UI to accept the terms and conditions
  console.log('[BTF OPERATIONS] COMPLETE');
}

/**̦
 * All actions that need to be performed periodically.
 */
export const performPeriodicOperations = async () => {
  console.log('[PERIODIC OPERATIONS] RUNNING');
  await commonAppOperations();
  console.log('[PERIODIC OPERATIONS] COMPLETE');
};

const debouncedCommonAppOperations = debounce(commonAppOperations, 2000, {
  leading: true,
  trailing: false,
});

export function performDebouncedCommonAppOperations() {
  debouncedCommonAppOperations();
}
