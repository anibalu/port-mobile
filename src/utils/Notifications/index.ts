import {AppState, Platform, Settings} from 'react-native';

import notifee, {
  AndroidColor,
  AndroidGroupAlertBehavior,
  AndroidMessagingStyle,
  AndroidPerson,
  AndroidStyle,
  AndroidVisibility,
  EventDetail,
  EventType,
  Notification,
} from '@notifee/react-native';
import axios from 'axios';

import {isIOS} from '@components/ComponentUtils';

import {PERMISSION_MANAGEMENT_URL} from '@configs/api';
import {DEFAULT_AVATAR} from '@configs/constants';

import {getToken} from '@utils/ServerAuth';
import {getConnection} from '@utils/Storage/connections';
import {ChatType} from '@utils/Storage/DBCalls/connections';



/**
 * Routes the user to the appropriate chat screen when a notification is pressed
 * @param type - The type of notification event (e.g. press, dismiss)
 * @param detail - Contains notification data like chatId and source
 * @param navigation - Navigation object to handle screen transitions
 */
export const performNotificationRouting = async (
  type: EventType,
  detail: EventDetail,
  navigation: any,
) => {
  // Only handle notification press events that contain data
  if (type === EventType.PRESS && detail.notification?.data) {
    const {chatId, source} = detail.notification.data;
    // Use chatId if available, otherwise fallback to source
    const finalChatId = chatId || source;

    if (finalChatId) {
      try {
        const chatIdAsString = finalChatId as string;
        const connection = await getConnection(chatIdAsString);

        // Route to appropriate chat screen based on connection type
        if (connection.connectionType === ChatType.group) {
          // todo:navigation see whats going on
          navigation.navigate('GroupChat', {
            chatId: connection.chatId,
            isConnected: !connection.disconnected,
            profileUri: connection.pathToDisplayPic || DEFAULT_AVATAR,
            name: connection.name,
          });
        } else {
          // todo:navigation see whats going on
          navigation.navigate('DirectChat', {
            chatId: connection.chatId,
            isConnected: !connection.disconnected,
            profileUri: connection.pathToDisplayPic || DEFAULT_AVATAR,
            name: connection.name,
            isAuthenticated: connection.authenticated,
          });
        }
      } catch (error) {
        console.error('Error routing notification to chat: ', error);
      }
    }
  }
};

/**
 * Displays all notifications for the app.
 * @param chatName
 * @param body
 * @param chatId the chat that is linked to the notification
 * @param isGroup defines if the chat being linked to is a group
 */
export async function displaySimpleNotification(
  chatName: string,
  body: string,
  isConnected: boolean,
  chatId?: string,
  isGroup: boolean = false,
  memberName?: string,
) {
  /*
   * Guard to remove client-generated notifications on iOS until
   * we receive NSE Entitlement
   */
  if (Platform.OS === 'ios') {
    return;
  }
  // If the app is foregrounded, skip the notification
  if (AppState.currentState === 'active') {
    return;
  }
  const channelId = await setupNotifee();
  console.info('notification channelId: ', channelId);
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
  const newestMessage: {
    text: string;
    timestamp: number;
    person?: AndroidPerson;
  } = {
    text: body,
    timestamp: Date.now(),
  };
  if (memberName) {
    const person = {name: memberName};
    newestMessage.person = person;
  }
  messages.push(newestMessage);

  const notification: Notification = {
    title: chatName,
    body: body,
    data: {
      ...(chatId && {chatId: chatId}),
      isGroup: isGroup.toString(),
      isConnected: isConnected.toString(),
    },
    android: {
      channelId,
      smallIcon: 'ic_small_icon',
      style: {
        type: AndroidStyle.MESSAGING,
        person: {
          name: chatName,
        },
        messages: messages,
        group: isGroup,
        title: chatName,
      },
      // Open the app when the notification is pressed
      pressAction: {
        id: 'default',
      },
      groupId: chatId,
      groupSummary: false,
      groupAlertBehavior: AndroidGroupAlertBehavior.ALL,
      color: AndroidColor.PURPLE,
    },
  };

  // Replace the existing notification for this chat with a new one that includes
  // the latest message
  if (notificationIdToReplace) {
    await notifee.cancelDisplayedNotification(notificationIdToReplace);
  }
  await notifee.displayNotification(notification);
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
