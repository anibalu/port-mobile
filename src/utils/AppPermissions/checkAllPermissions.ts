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

  const settings = await notifee.getNotificationSettings();

  if (cameraPermission === undefined || recordingPermission === undefined) {
    console.log('This platform is not supported');
    return false;
  }

  const [cameraStatus, recordingStatus] = await Promise.all([
    check(cameraPermission),
    check(recordingPermission),
  ]);

  return (
    cameraStatus === RESULTS.GRANTED &&
    recordingStatus === RESULTS.GRANTED &&
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED
  );
};
