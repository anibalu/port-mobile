import {isIOS} from '@components/ComponentUtils';
import {PermissionsAndroid, Platform} from 'react-native';
import {
  PERMISSIONS,
  check,
  request,
  RESULTS,
  Permission,
} from 'react-native-permissions';
import notifee, {AuthorizationStatus} from '@notifee/react-native';

/**
 * Self explanatory
 * @param setIsCameraPermissionGranted - a setter function that sets state based on the response
 * @param setIsRecordingPermissionGranted - a setter function that sets state based on the response
 */

export const checkCameraPermission = async (
  setIsCameraPermissionGranted: Function,
) => {
  const requestCameraPermission = async (cameraPermission: Permission) => {
    const cameraPermissionStatus = await request(cameraPermission);
    if (cameraPermissionStatus === RESULTS.GRANTED) {
      setIsCameraPermissionGranted(true);
    }
  };
  const cameraPermission = Platform.select({
    android: PERMISSIONS.ANDROID.CAMERA,
    ios: PERMISSIONS.IOS.CAMERA,
  });
  if (cameraPermission === undefined) {
    console.log('This platform is not supported');
    return;
  }
  const cameraPermissionStatus = await check(cameraPermission);
  switch (cameraPermissionStatus) {
    case RESULTS.UNAVAILABLE:
      console.log(
        'This feature is not available (on this device / in this context)',
      );
      break;
    case RESULTS.DENIED:
      console.log(
        'The permission has not been requested / is denied but requestable',
      );
      await requestCameraPermission(cameraPermission);
      break;
    case RESULTS.GRANTED:
      console.log('The permission is granted');
      setIsCameraPermissionGranted(true);
      break;
    case RESULTS.BLOCKED:
      console.log('The permission is denied and not requestable anymore');
      break;
  }
  return;
};

/**
 * Function to check camera roll save permissions. On Android, it additionally asks for permissions if not granted.
 */
export async function hasCameraRollSavePermission() {
  if (isIOS) {
    const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
    return result === RESULTS.GRANTED;
  } else {
    const getCheckPermissionPromise = async () => {
      if (typeof Platform.Version === 'number' && Platform.Version >= 33) {
        const [hasReadMediaImagesPermission, hasReadMediaVideoPermission] =
          await Promise.all([
            PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            ),
            PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            ),
          ]);
        return hasReadMediaImagesPermission && hasReadMediaVideoPermission;
      } else {
        return await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );
      }
    };

    const hasPermission = await getCheckPermissionPromise();
    if (hasPermission) {
      return true;
    }
    const getRequestPermissionPromise = async () => {
      if (typeof Platform.Version === 'number' && Platform.Version >= 33) {
        const statuses = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);
        return (
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const status = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );
        return status === PermissionsAndroid.RESULTS.GRANTED;
      }
    };

    return await getRequestPermissionPromise();
  }
}

/**
 * Function to check and request contact read permissions
 */
export async function checkAndAskContactPermission(): Promise<boolean> {
  try {
    const requestContactPermission = async (contactPermission: Permission) => {
      const contactPermissionStatus = await request(contactPermission);
      console.log('Requested contactPermissionStatus', contactPermissionStatus);
      if (contactPermissionStatus === RESULTS.GRANTED) {
        return true;
      }
      return false;
    };

    const contactPermission = Platform.select({
      android: PERMISSIONS.ANDROID.READ_CONTACTS,
      ios: PERMISSIONS.IOS.CONTACTS,
    });

    if (contactPermission === undefined) {
      console.log('This platform is not supported');
      return false;
    }

    const contactPermissionStatus = await check(contactPermission);
    console.log('Checked contactPermissionStatus', contactPermissionStatus);

    switch (contactPermissionStatus) {
      case RESULTS.UNAVAILABLE:
        console.log(
          'This feature is not available (on this device / in this context)',
        );
        return false;
      case RESULTS.DENIED:
        console.log(
          'The permission has not been requested / is denied but requestable',
        );
        return await requestContactPermission(contactPermission);
      case RESULTS.GRANTED:
        console.log('The permission is granted');
        return true;
      case RESULTS.BLOCKED:
        console.log('The permission is denied and not requestable anymore');
        return false;
    }
    return false;
  } catch (error) {
    console.error(
      'An error occurred while checking contact permission:',
      error,
    );
    return false;
  }
}

//setup notification channels for the app. this also requests permissions.
const setupNotificationChannels = async () => {
  try {
    // Needed for iOS
    await notifee.requestPermission();
    // Needed for Android
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });
  } catch (error) {
    console.error('Error setting up notification channels:', error);
  }
};

//checks if notification permission is granted
async function checkNotificationPermission() {
  try {
    const settings = await notifee.getNotificationSettings();
    if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
      return true;
    } else if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
      return false;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return false;
  }
}

/**
 * Function to check notification permission
 */
export async function checkAndAskNotificationPermission() {
  await setupNotificationChannels();
  return await checkNotificationPermission();
}
