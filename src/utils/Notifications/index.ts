import notifee from '@notifee/react-native';

export async function displaySimpleNotification(title: string, body: string) {
  // Needed for iOS
  await notifee.requestPermission();
  // Needed for Android
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  // Display a notification
  await notifee.displayNotification({
    title: title,
    body: body,
    android: {
      channelId,
      // Open the app when the notification is pressed
      pressAction: {
        id: 'default',
      },
    },
  });
}

export async function cancelAllNotifications() {
  // Clear all notifications
  await notifee.cancelAllNotifications();
}
