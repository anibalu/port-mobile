import notifee, {AndroidVisibility, Notification} from '@notifee/react-native';
import store from '@store/appStore';
import {Platform} from 'react-native';

/**
 * Displays all notifications for the app.
 * @param title
 * @param body
 * @param chatId the chat that is linked to the notification
 * @param isGroup defines if the chat being linked to is a group
 */
export async function displaySimpleNotification(
  title: string,
  body: string,
  isConnected: boolean,
  chatId?: string,
  isGroup: boolean = false,
) {
  /*
   * Guard to remove client-generated notifications on iOS until
   * we receive NSE Entitlement
   */
  if ('ios' == Platform.OS) {
    return;
  }
  const channelId = await setupNotifee();
  const entireState = store.getState();
  const currentActiveChatId = entireState.profile.activeChat;

  const notification: Notification = {
    title: title,
    body: body,
    data: {
      ...(chatId && {chatId: chatId}),
      isGroup: isGroup.toString(),
      isConnected: isConnected.toString(),
    },
    android: {
      channelId,
      visibility: AndroidVisibility.SECRET,
      // Open the app when the notification is pressed
      pressAction: {
        id: 'default',
      },
    },
  };
  if (currentActiveChatId) {
    //Display notifications when it's not for the active chat
    if (chatId !== currentActiveChatId) {
      // Display a notification
      await notifee.displayNotification(notification);
    }
  } else {
    // Display a notification since there is no defined tracker for this
    await notifee.displayNotification(notification);
  }
}

/**
 * Default notification for when any operation during handling notifications fails.
 */
export async function showDefaultNotification() {
  const channelId = await setupNotifee();
  const notification: Notification = {
    title: 'You may have new messages',
    body: 'Open the app to see if you have new connections or messages',
    android: {
      channelId,
      visibility: AndroidVisibility.SECRET,
      // Open the app when the notification is pressed
      pressAction: {
        id: 'default',
      },
    },
  };
  await notifee.displayNotification(notification);
}

/**
 * Sets up notifee initially.
 * @returns {Promise<string>} which has the channelID (for Android)
 */
const setupNotifee = async (): Promise<string> => {
  // Needed for iOS
  await notifee.requestPermission();
  // Needed for Android
  return await notifee.createChannel({
    id: 'default',
    name: 'Messaging Notifications',
  });
};

export async function cancelAllNotifications() {
  // Clear all notifications
  await notifee.cancelAllNotifications();
}
