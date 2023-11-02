/**
 * custom SafeAreaView for Port that uses safe insets.
 */
import React from 'react';
import {StyleSheet, View, ViewStyle, ViewProps} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export function SafeAreaView({children, style, ...rest}: ViewProps) {
  const insets = useSafeAreaInsets();

  const safeAreaStyle: ViewStyle = {
    paddingTop: insets.top,
    paddingLeft: insets.left,
    paddingRight: insets.right,
    paddingBottom: insets.bottom,
  };

  return (
    <View style={StyleSheet.compose(style, safeAreaStyle)} {...rest}>
      {children}
    </View>
  );
}
