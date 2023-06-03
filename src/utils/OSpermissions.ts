import {Platform} from 'react-native';
import {check, PERMISSIONS, RESULTS, request} from 'react-native-permissions';

export const checkPermission = async () => {
  if (Platform.OS === 'ios') {
    // check if the permission is available
    const checkResult = await check(PERMISSIONS.IOS.USER_FACING_NOTIFICATIONS);
    switch (checkResult) {
      case RESULTS.UNAVAILABLE:
        console.log('This feature is not available.');
        break;
      case RESULTS.DENIED:
        console.log('Permission denied, requesting permission.');
        const requestResult = await request(
          PERMISSIONS.IOS.USER_FACING_NOTIFICATIONS,
        );
        if (requestResult === RESULTS.GRANTED) {
          console.log('Permission granted.');
        }
        break;
      case RESULTS.GRANTED:
        console.log('The permission is granted.');
        break;
    }
  }
};
