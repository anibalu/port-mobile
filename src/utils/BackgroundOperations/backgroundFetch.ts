import {performPeriodicOperations} from '@utils/AppOperations';
import BackgroundFetch from 'react-native-background-fetch';

export async function initBackgroundFetch() {
  // Initialize BackgroundFetch only once when component mounts.
  const status = await BackgroundFetch.configure(
    {minimumFetchInterval: 15},
    allottedBackgroundTime,
    onTimeout,
  );

  if (status === 2) {
    console.log('[BackgroundFetch] Available');
  } else {
    console.log('[BackgroundFetch] Unavailable, status: ', status);
  }
}

async function allottedBackgroundTime(taskId: string) {
  console.log('[Starting background fetch]: ', taskId);
  await performPeriodicOperations();
  console.log('[Completed background fetch withing allotted time]: ', taskId);
  BackgroundFetch.finish(taskId);
}

async function onTimeout(taskId: string) {
  console.warn('[Did not finish background fetch in allotted time]: ', taskId);
  // Add cleanup here
  BackgroundFetch.finish(taskId);
}

// On android force background fetch using the following while debugging
// adb shell cmd jobscheduler run -f com.numberless 999
