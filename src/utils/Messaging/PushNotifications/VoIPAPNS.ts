/**
 * Methods to register the device for VoIP Push Notifications over APNS on iOS
 */

import {isIOS} from '@components/ComponentUtils';
import RNVoipPushNotification from 'react-native-voip-push-notification';
import * as API from './APICalls';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getProfileInfo} from '@utils/Profile';

export type APNSToken = string;
// The key in async storage for the cached APNS token
const APNS_KEY = 'apnsToken';

/**
 * Writes APNSToken in AsyncStorage with new info
 * @param {APNSToken} APNSToken - the token information to overwrite with
 */
async function cacheAPNSToken(APNSToken: APNSToken): Promise<void> {
  await AsyncStorage.setItem(APNS_KEY, APNSToken);
}

/**
 * Reads APNS info from AsyncStorage
 * @returns {APNSToken|undefined} - APNS info read from AsyncStorage. Returns undefined if the storage doesn't exist
 */
async function readCachedAPNSToken(): Promise<APNSToken | undefined> {
  try {
    const APNSToken: any = await AsyncStorage.getItem(APNS_KEY);
    return APNSToken;
  } catch (error) {
    console.log('Error reading token from AsyncStorage: ', error);
    return undefined;
  }
}

export async function registerForVoIPPushNotifications(): Promise<void> {
  if (!isIOS) {
    // Android devices don't use APNS
    return;
  }

  RNVoipPushNotification.addEventListener(
    'register',
    async currentAPNSToken => {
      console.log('Checking APNS token for updates: ', currentAPNSToken);
      await cacheAPNSToken('Nonsense');
      const cachedAPNSToken = await readCachedAPNSToken();
      // Check if the APNS token has changed. If it has, we need to notify our backend
      // of the change.
      if (currentAPNSToken && cachedAPNSToken !== currentAPNSToken) {
        console.log('Updating token');
        await API.patchToken('apnstoken', currentAPNSToken);
        console.log('Patched token');
        await cacheAPNSToken(currentAPNSToken);
        console.log('Updated APNS token', (await getProfileInfo())!.clientId);
      } else {
        console.log("Didn't update APNS token");
      }
    },
  );
  RNVoipPushNotification.registerVoipToken();
}
