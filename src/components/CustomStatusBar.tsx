import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {PortColors, isIOS} from './ComponentUtils';
import DeviceInfo from 'react-native-device-info';

/**
 *
 * @param backgroundColor - pass this prop ONLY if no back button should be shown. This absolutely positions the element for welcome page
 * @returns Status bar
 */
export const CustomStatusBar = ({
  backgroundColor = PortColors.primary.white,
  ...props
}) =>
  isIOS ? (
    <View
      style={StyleSheet.compose(styles.appBar, {
        backgroundColor: backgroundColor,
      })}
    />
  ) : (
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  );
const STATUSBAR_HEIGHT = StatusBar.currentHeight;

//For devices with a notch, we don't need to add an APPBAR_HEIGHT (both iOS and Android)
const APPBAR_HEIGHT = DeviceInfo.hasNotch() ? (isIOS ? 50 : 56) : 0;

const styles = StyleSheet.create({
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
  appBar: {
    height: APPBAR_HEIGHT,
  },
});
