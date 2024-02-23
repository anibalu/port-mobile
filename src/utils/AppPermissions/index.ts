import {Platform} from 'react-native';
import {
  PERMISSIONS,
  check,
  request,
  RESULTS,
  Permission,
} from 'react-native-permissions';

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

export const checkRecordingPermission = async (
  setIsRecordingPermissionGranted: Function,
) => {
  const requestRecordingPermission = async (
    recordingPermission: Permission,
  ) => {
    const recordingPermissionStatus = await request(recordingPermission);
    if (recordingPermissionStatus === RESULTS.GRANTED) {
      setIsRecordingPermissionGranted(true);
    }
  };
  const recordingPermission = Platform.select({
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
    ios: PERMISSIONS.IOS.MICROPHONE,
  });
  if (recordingPermission === undefined) {
    console.log('This platform is not supported');
    return;
  }
  const recordingPermissionStatus = await check(recordingPermission);
  switch (recordingPermissionStatus) {
    case RESULTS.UNAVAILABLE:
      console.log(
        'This feature is not available (on this device / in this context)',
      );
      break;
    case RESULTS.DENIED:
      console.log(
        'The permission has not been requested / is denied but requestable',
      );
      await requestRecordingPermission(recordingPermission);
      break;
    case RESULTS.GRANTED:
      console.log('The permission is granted');
      setIsRecordingPermissionGranted(true);
      break;
    case RESULTS.BLOCKED:
      console.log('The permission is denied and not requestable anymore');
      break;
  }
  return;
};
