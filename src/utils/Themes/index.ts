import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME = 'theme';

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
  } catch {
    return false;
  }
}
/**
 * this util gets the item stored in async storage. Incase this fails, it will get the default theme
 * @returns theme
 */

export async function getTheme(): Promise<ThemeType> {
  try {
    const itemString = await AsyncStorage.getItem(THEME);
    if (itemString) {
      return itemString as ThemeType;
    } else {
      await saveTheme(ThemeType.default);
      return ThemeType.default;
    }
  } catch {
    return ThemeType.default;
  }
}

export interface ThemeOptionTypes {
  key: string;
  value: ThemeType;
}

export const themeOptions: ThemeOptionTypes[] = [
  {
    key: 'System default',
    value: ThemeType.default,
  },
  {
    key: 'Light',
    value: ThemeType.light,
  },
  {
    key: 'Dark',
    value: ThemeType.dark,
  },
];
