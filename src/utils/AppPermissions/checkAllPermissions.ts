import {Platform} from 'react-native';
import {PERMISSIONS, check, RESULTS} from 'react-native-permissions';
import notifee, {AuthorizationStatus} from '@notifee/react-native';

export const checkPermissions = async () => {
  const cameraPermission = Platform.select({
    android: PERMISSIONS.ANDROID.CAMERA,
    ios: PERMISSIONS.IOS.CAMERA,
  });

  const recordingPermission = Platform.select({
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
    ios: PERMISSIONS.IOS.MICROPHONE,
  });

  const savingImagesPermission = Platform.select({
    android: PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
  });

  const settings = await notifee.getNotificationSettings();

  if (
    cameraPermission === undefined ||
    recordingPermission === undefined ||
    savingImagesPermission === undefined
  ) {
    console.log('This platform is not supported');
    return false;
  }

  const [cameraStatus, recordingStatus, savingImagesStatus] = await Promise.all(
    [
      check(cameraPermission),
      check(recordingPermission),
      check(savingImagesPermission),
    ],
  );

  return (
    cameraStatus === RESULTS.GRANTED &&
    recordingStatus === RESULTS.GRANTED &&
    savingImagesStatus === RESULTS.GRANTED &&
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED
  );
};
