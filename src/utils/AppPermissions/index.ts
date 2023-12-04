import {Platform} from 'react-native';
import {
  PERMISSIONS,
  check,
  request,
  RESULTS,
  Permission,
} from 'react-native-permissions';

/**
 * Checks whether the app has notification permissions. If not, requests permissions.
 * @returns {boolean} whether the permission is granted.
 */
export const checkNotificationPermission = async () => {
  if (Platform.OS === 'ios') {
    // check if the permission is available
    const checkResult = await check(PERMISSIONS.IOS.USER_FACING_NOTIFICATIONS);
    switch (checkResult) {
      case RESULTS.UNAVAILABLE:
        console.log('This feature is not available.');
        return false;
      case RESULTS.DENIED:
        console.log('Permission denied, requesting permission.');
        const requestResult = await request(
          PERMISSIONS.IOS.USER_FACING_NOTIFICATIONS,
        );
        if (requestResult === RESULTS.GRANTED) {
          console.log('Permission granted.');
        }
        return false;
      case RESULTS.GRANTED:
        console.log('The permission is granted.');
        return true;
    }
  }
};

/**
 * Self explanatory
 * @param setIsCameraPermissionGranted, a setter function that sets state based on the response
 * @returns {null};
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
      requestCameraPermission(cameraPermission);
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
