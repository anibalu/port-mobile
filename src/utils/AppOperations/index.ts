import store from '@store/appStore';
import sendJournaled from '@utils/Messaging/Send/sendJournaled';
import pullBacklog from '@utils/Messaging/pullBacklog';
import {cancelAllNotifications} from '@utils/Notifications';
import {cleanUpPorts, useReadBundles} from '@utils/Ports';
import {
  deleteExpiredGroupMessages,
  deleteExpiredMessages,
} from '@utils/Storage/messages';
import {debounce} from 'lodash';

/**
 * All actions that need to be performed when the app goes from foreground to background
 */
export async function performBackgroundToForegroundOperations() {
  console.log('[BTF OPERATIONS RUNNING]');
  // Ping to redraw as needed
  store.dispatch({
    type: 'PING',
    payload: 'PONG',
  });

  await cleanUpPorts();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  await useReadBundles();
  await cancelAllNotifications();
  console.log('[BTF OPERATIONS COMPLETE]');
}

/**̦
 * All actions that need to be performed periodically.
 */
export const performPeriodicOperations = async () => {
  console.log('[PERIODIC OPERATIONS RUNNING]');
  await pullBacklog();
  await sendJournaled();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  await useReadBundles();
  // delete expired ports
  await cleanUpPorts();
  // delete expired direct and group messages
  await deleteExpiredGroupMessages();
  await deleteExpiredMessages();
  console.log('[PERIODIC OPERATIONS COMPLETE]');
};

export const debouncedPeriodicOperations = debounce(
  performPeriodicOperations,
  1000,
);
export const debouncedBtFOperations = debounce(
  performBackgroundToForegroundOperations,
  1000,
);
