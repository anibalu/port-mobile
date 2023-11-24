import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {PortColors, isIOS} from './ComponentUtils';

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
const APPBAR_HEIGHT = isIOS ? 50 : 56;

const styles = StyleSheet.create({
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
  appBar: {
    height: APPBAR_HEIGHT,
  },
});
