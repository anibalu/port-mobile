import {Dimensions} from 'react-native';
export const screen = Dimensions.get('window');

/**
 * Spacing values for the app.
 */
export const Spacing = {
  ll: 96,
  xxxxl: 80,
  xxxl: 64,
  xxl: 48,
  xml: 32,
  xl: 24,
  l: 16,
  m: 12,
  s: 8,
  xs: 4,
};

/**
 * Height values for the app.
 */
export const Height = {
  topbar: 68,
  bottombar: 72,
  screen: screen.height,
  title: 48,
  lineSeparator: 9,
  inputBar: 48,
  optionBar: 48,
  memberOptionBar: 56,
  button: 48,
  label: 28,
  searchBar: 44,
};

/**
 * Width values for the app.
 */
export const Width = {
  screen: screen.width,
};

/**
 * Size values for the app.
 */
export const Size = {
  s: 12,
  m: 20,
  l: 24,
  xl: 32,
  xxl: 48,
};
