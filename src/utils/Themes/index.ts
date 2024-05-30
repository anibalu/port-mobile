import {THEME} from '@configs/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum ThemeType {
  dark = 'dark',
  light = 'light',
  default = 'default',
}

/**
 * this util makes a async storage call to set the theme
 * @param value takes in ThemeType
 * @returns returns a boolean
 */

export async function saveTheme(value: ThemeType) {
  try {
    await AsyncStorage.setItem(THEME, value);
    return true;
  } catch (error) {
    return false;
  }
}
/**
 * this util gets the item stored in async storage. Incase this fails, it will get the default theme
 * @returns theme
 */

export async function getTheme() {
  try {
    const itemString = await AsyncStorage.getItem(THEME);
    if (itemString) {
      return itemString;
    } else {
      await saveTheme(ThemeType.default);
      return ThemeType.default;
    }
  } catch (error) {
    return ThemeType.default;
  }
}

export default {
  saveTheme,
  getTheme,
};
