/**
 * custom SafeAreaView for Port that uses safe insets.
 * Wrap this component around your screen so that the app handles various phone with various notches well.
 */
import React from 'react';
import {StyleSheet, ViewProps, ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {PortColors, PortSpacing, isIOS} from './ComponentUtils';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

export function GestureSafeAreaView({children, style, ...rest}: ViewProps) {
  const insets = useSafeAreaInsets();
  const safeAreaStyle: ViewStyle = {
    flex: 1,
    backgroundColor: PortColors.primary.white,
    paddingTop: isIOS ? 0 : insets.top,
    paddingLeft: insets.left,
    paddingRight: insets.right,
    paddingBottom: isIOS ? PortSpacing.secondary.bottom : insets.bottom,
  };

  return (
    <GestureHandlerRootView
      style={StyleSheet.compose(safeAreaStyle, style)}
      {...rest}>
      {children}
    </GestureHandlerRootView>
  );
}
