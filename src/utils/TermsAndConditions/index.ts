import AsyncStorage from '@react-native-async-storage/async-storage';
import {TermsAndConditionParams, getTermsAndConditions} from './APICalls';
import store from '@store/appStore';
import {getProfileInfo} from '@utils/Profile';
import {ProfileInfo} from '@utils/Storage/RNSecure/secureProfileHandler';

/**
 * Triggers a reload of refetching UpdateStatus from localstorage
 */
export function triggerUpdateStatusRefetch() {
  store.dispatch({
    type: 'TRIGGER_REFETCH',
  });
}

export async function checkForUpdates() {
  const profile: ProfileInfo | undefined = await getProfileInfo();
  if (!profile) {
    return;
  }
  //make api call if needsToAccept value is false/not present in local storage
  const localResponse = await getUpdateStatusKeyFromLocal();
  if (localResponse && localResponse.needsToAccept) {
    await saveUpdateStatusToLocal({needsToAccept: true, shouldNotify: false});
  } else {
    const response = await getTermsAndConditions();
    if (response !== null) {
      // if hardNotif and softNotif both are true then we will only show hardNotif modal
      await saveUpdateStatusToLocal(response);
    } else {
      console.error('Failed to fetch Terms and Conditions');
    }
  }
  triggerUpdateStatusRefetch();
}

export async function saveUpdateStatusToLocal(value: TermsAndConditionParams) {
  try {
    await AsyncStorage.setItem('TnCUpdateStatus', JSON.stringify(value));
  } catch (error) {
    console.log('saveUpdateStatusToLocal error', error);
  }
}

export async function getUpdateStatusKeyFromLocal() {
  try {
    const itemString = await AsyncStorage.getItem('TnCUpdateStatus');
    if (itemString) {
      return JSON.parse(itemString);
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
