/**
 * custom SafeAreaView for Port that uses safe insets.
 * Wrap this component around your screen so that the app handles various phone with various notches well.
 */
import React from 'react';
import {StyleSheet, View, ViewProps, ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {PortColors, PortSpacing, isIOS} from './ComponentUtils';

export function SafeAreaView({children, style, ...rest}: ViewProps) {
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
    <View style={StyleSheet.compose(safeAreaStyle, style)} {...rest}>
      {children}
    </View>
  );
}
