/*
custom SafeAreaView for Numberless that uses safe insets.
*/
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export function SafeAreaView({children, style, ...rest}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={StyleSheet.compose(style, {
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        paddingBottom: insets.bottom,
      })}
      {...rest}>
      {children}
    </View>
  );
}
