import {isIOS} from '@components/ComponentUtils';
import {PERMISSION_MANAGEMENT_URL} from '@configs/api';
import notifee, {
  AndroidGroupAlertBehavior,
  AndroidMessagingStyle,
  AndroidStyle,
  AndroidVisibility,
  EventDetail,
  EventType,
  Notification,
} from '@notifee/react-native';
import store from '@store/appStore';
import {getToken} from '@utils/ServerAuth';
import axios from 'axios';
import {AppState, Platform, Settings} from 'react-native';

//Handles notification routing on tapping notification
export const performNotificationRouting = (
  type: EventType,
  detail: EventDetail,
  navigation: any,
) => {
  if (type === EventType.PRESS && detail.notification?.data) {
    const {chatId, isGroup, isConnected, isAuthenticated} =
      detail.notification.data;

    if (
      chatId !== undefined &&
      isGroup !== undefined &&
      isConnected !== undefined
    ) {
      navigation.push('DirectChat', {
        chatId: chatId,
        isGroupChat: (isGroup as string).toLowerCase() === 'true',
        isConnected: (isConnected as string).toLowerCase() === 'true',
        profileUri: '',
        isAuthenticated: isAuthenticated
          ? (isAuthenticated as string).toLowerCase() === 'true'
          : false,
      });
    }
  }
};

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
  if (Platform.OS === 'ios') {
    return;
  }
  const channelId = await setupNotifee();
  console.info('notification channelId: ', channelId);
  const entireState = store.getState();
  const currentActiveChatId = entireState.profile.activeChat;
  const currentNotifications = await notifee.getDisplayedNotifications();
  let messages: any[] = [];
  let notificationIdToReplace: string | undefined;
  for (let i = 0; i < currentNotifications.length; i++) {
    // Iterate over existing notifications to try to find a matching one.
    console.info(currentNotifications[i]);
    if (
      currentNotifications[i].notification.android?.groupId === chatId &&
      currentNotifications[i].notification.android?.style?.type ===
        AndroidStyle.MESSAGING
    ) {
      messages = (
        currentNotifications[i].notification.android
          ?.style as AndroidMessagingStyle
      ).messages;
      notificationIdToReplace = currentNotifications[i].id;
    }
  }

  // Add the message to the list of existing messages for this chat's notification
  messages.push({text: body, timestamp: Date.now()});

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
      style: {
        type: AndroidStyle.MESSAGING,
        person: {
          name: title,
        },
        messages: messages,
      },
      // Open the app when the notification is pressed
      pressAction: {
        id: 'default',
      },
      groupId: chatId,
      groupSummary: true,
      groupAlertBehavior: AndroidGroupAlertBehavior.ALL,
    },
  };

  // Replace the existing notification for this chat with a new one that includes
  // the latest message
  if (notificationIdToReplace) {
    await notifee.cancelDisplayedNotification(notificationIdToReplace);
  }

  // If app is not in the foreground, display no matter what
  if (AppState.currentState !== 'active') {
    await notifee.displayNotification(notification);
    return;
  }
  // Display a notification if I am on any screen that isn't the current chat
  if (currentActiveChatId && currentActiveChatId !== chatId) {
    await notifee.displayNotification(notification);
    return;
  }
}

/**
 * Default notification for when any operation during handling notifications fails.
 */
export async function showDefaultNotification() {
  /*
   * Guard to remove client-generated notifications on iOS until
   * we receive NSE Entitlement
   */
  if (Platform.OS === 'ios') {
    return;
  }
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
  if (Platform.OS === 'ios') {
    await notifee.requestPermission();
  }
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

/**
 * Reset the app badge on iOS devices
 * For related functionality see the portnse notification service
 * extension
 */
export async function resetAppBadge() {
  if (!isIOS) {
    return;
  }
  await notifee.setBadgeCount(0);
  Settings.set({count: 1});
}

interface chatWithType {
  id: string;
  type: 'line' | 'group';
}

/**
 * Set the notification permission for multiple chats on the back end
 * @param on Should notifications be set to on or off
 * @param chats the chats to update
 */
export async function setRemoteNotificationPermissionsForChats(
  on: boolean,
  chats: chatWithType[],
) {
  const token = await getToken();
  await axios.patch(
    PERMISSION_MANAGEMENT_URL,
    {
      notifications: on,
      // TODO Group logic needs to be shimmed when implemented
      chats,
    },
    {headers: {Authorization: `${token}`}},
  );
}
