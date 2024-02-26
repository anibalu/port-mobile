import sendJournaled from '@utils/Messaging/Send/sendJournaled';
import pullBacklog from '@utils/Messaging/pullBacklog';
import {cancelAllNotifications} from '@utils/Notifications';
import {useReadBundles} from '@utils/Ports';
import {
  deleteExpiredGroupMessages,
  deleteExpiredMessages,
} from '@utils/Storage/messages';
import {debounce} from 'lodash';

/**
 * All actions that need to be performed when the app goes from foreground to background
 */
const performBackgroundToForegroundOperations = async () => {
  console.log('[BTF OPERATIONS RUNNING]');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  await useReadBundles();
  await cancelAllNotifications();
  console.log('[BTF OPERATIONS COMPLETE]');
};

/**̦
 * All actions that need to be performed periodically.
 */
export const performPeriodicOperations = async () => {
  console.log('[PERIODIC OPERATIONS RUNNING]');
  await pullBacklog();
  await sendJournaled();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  await useReadBundles();
  await deleteExpiredGroupMessages();
  await deleteExpiredMessages();
  console.log('[PERIODIC OPERATIONS COMPLETE]');
};

export const debouncedPeriodicOperations = debounce(
  performPeriodicOperations,
  2000,
);
export const debouncedBtFOperations = debounce(
  performBackgroundToForegroundOperations,
  1000,
);
