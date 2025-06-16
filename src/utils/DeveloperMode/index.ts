import AsyncStorage from "@react-native-async-storage/async-storage";

import store from "@store/appStore";

/**
 * Gets the developer mode from storage.
 * If it is true, it turns on the developer mode.
 * If it is false, it turns off the developer mode.
 * 
 * @returns {Promise<boolean>} - The developer mode.
 */
export async function getDeveloperModeFromStorage() {
    const itemString = await AsyncStorage.getItem('DeveloperMode');
    if (itemString && itemString === 'true') {
        store.dispatch({ type: 'TURN_ON_DEVELOPER_MODE' });
        return true;
    } else {
        store.dispatch({ type: 'TURN_OFF_DEVELOPER_MODE' });
        return false;
    }
}

/**
 * Sets the developer mode in storage.
 * 
 * @param {boolean} developerMode - The developer mode.
 */
export async function setDeveloperModeInStorage(developerMode: boolean) {
    await AsyncStorage.setItem('DeveloperMode', developerMode.toString());
}

/**
 * Turns on the developer mode.
 */
export async function turnOnDeveloperMode() {
    store.dispatch({ type: 'TURN_ON_DEVELOPER_MODE' });
    await setDeveloperModeInStorage(true);
}

/**
 * Turns off the developer mode.
 */
export async function turnOffDeveloperMode() {
    store.dispatch({ type: 'TURN_OFF_DEVELOPER_MODE' });
    await setDeveloperModeInStorage(false);
}