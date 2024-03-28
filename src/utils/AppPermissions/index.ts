import {isIOS} from '@components/ComponentUtils';
import {PermissionsAndroid, Platform} from 'react-native';
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

export const checkRecordingPermissions = async (): Promise<boolean> => {
  const recordingPermission = Platform.select({
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
    ios: PERMISSIONS.IOS.MICROPHONE,
  });
  if (recordingPermission === undefined) {
    console.log('This platform is not supported');
    return false;
  }
  const recordingPermissionStatus = await check(recordingPermission);
  switch (recordingPermissionStatus) {
    case RESULTS.UNAVAILABLE:
      console.log(
        'This feature is not available (on this device / in this context)',
      );
      return false;
    case RESULTS.DENIED:
      console.log(
        'The permission has not been requested / is denied but requestable',
      );
      return false;

    case RESULTS.GRANTED:
      console.log('The permission is granted');
      return true;

    case RESULTS.BLOCKED:
      console.log('The permission is denied and not requestable anymore');
      return false;
  }
  return false;
};

export const checkAndGrantRecordingPermission = async (
  setIsRecordingPermissionGranted: Function,
) => {
  const requestRecordingPermission = async (
    recordingPermission: Permission,
  ) => {
    if (isIOS) {
      const recordingPermissionStatus = await request(recordingPermission);
      if (recordingPermissionStatus === RESULTS.GRANTED) {
        setIsRecordingPermissionGranted(true);
      }
    } else {
      const grants = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);

      console.log('write external stroage', grants);

      if (
        grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        grants['android.permission.READ_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        grants['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        setIsRecordingPermissionGranted(true);
      } else {
        console.log('All required permissions not granted');
        return;
      }
    }
    // const recordingPermissionStatus = await request(recordingPermission);
    // if (recordingPermissionStatus === RESULTS.GRANTED) {
    //   setIsRecordingPermissionGranted(true);
    // }
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

export const checkSavingImagesPermission = async (
  setIsSavingImagesPermissionGranted: Function,
) => {
  const requestSavingImagesPermission = async (
    savingImagesPermission: Permission,
  ) => {
    const savingImagesStatus = await request(savingImagesPermission);
    if (savingImagesStatus === RESULTS.GRANTED) {
      setIsSavingImagesPermissionGranted(true);
    }
  };
  const savingPermission = Platform.select({
    android: PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
  });
  if (savingPermission === undefined) {
    console.log('This platform is not supported');
    return;
  }
  const savingImagesStatus = await check(savingPermission);
  switch (savingImagesStatus) {
    case RESULTS.UNAVAILABLE:
      console.log(
        'This feature is not available (on this device / in this context)',
      );
      break;
    case RESULTS.DENIED:
      console.log(
        'The permission has not been requested / is denied but requestable',
      );
      await requestSavingImagesPermission(savingPermission);
      break;
    case RESULTS.GRANTED:
      console.log('The permission is granted');
      setIsSavingImagesPermissionGranted(true);
      break;
    case RESULTS.BLOCKED:
      console.log('The permission is denied and not requestable anymore');
      break;
  }
  return;
};
