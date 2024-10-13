import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {PortColors, isIOS} from './ComponentUtils';
import DeviceInfo from 'react-native-device-info';
import {useTheme} from 'src/context/ThemeContext';
import {useInsetChecks} from './DeviceUtils';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

/**
 * Status bar for the entire app.
 * Handles IOS and android whether notch exists or not.
 * @param backgroundColor - pass this prop ONLY if no back button should be shown. This absolutely positions the element for welcome page
 * @returns Status bar
 */
export const CustomStatusBar = ({
  backgroundColor = PortColors.primary.white,
  ...props
}) => {
  const {themeValue} = useTheme();
  const insets = useSafeAreaInsets();

  const {hasIosLargeTopInset} = useInsetChecks();
  //For devices with a notch, we don't need to add an APPBAR_HEIGHT (both iOS and Android)
  const APPBAR_HEIGHT = DeviceInfo.hasNotch()
    ? isIOS
      ? 50
      : 56
    : hasIosLargeTopInset
    ? 0
    : insets.top;

  const styles = styling(APPBAR_HEIGHT);

  return isIOS ? (
    <View
      style={StyleSheet.compose(styles.appBar, {
        backgroundColor: backgroundColor,
      })}
    />
  ) : (
    <StatusBar
      translucent
      backgroundColor={backgroundColor}
      {...props}
      barStyle={themeValue === 'dark' ? 'light-content' : 'dark-content'}
    />
  );
};
const STATUSBAR_HEIGHT = StatusBar.currentHeight;

const styling = (APPBAR_HEIGHT: any) =>
  StyleSheet.create({
    statusBar: {
      height: STATUSBAR_HEIGHT,
    },
    appBar: {
      height: APPBAR_HEIGHT,
    },
  });
