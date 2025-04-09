/**
 * custom SafeAreaView for Port that uses safe insets.
 * Wrap this component around your screen so that the app handles various phone with various notches well.
 */
import React, {useEffect, useMemo} from 'react';
import {StyleSheet, View, ViewProps, ViewStyle} from 'react-native';

import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {isIOS} from './ComponentUtils';

export interface SafeAreaViewProps extends ViewProps {
  backgroundColor?: string;
  modifyNavigationBarColor?: boolean; //android only
  bottomNavigationBarColor?: string; //android only
}
/**
 * SafeAreaView component that uses safe insets.
 * @param children - The children of the component.
 * @param style - The style of the component.
 * @param rest - The rest of the props.
 */
export function SafeAreaView({
  children,
  backgroundColor,
  bottomNavigationBarColor,
  modifyNavigationBarColor = false,
  style,
  ...rest
}: SafeAreaViewProps) {
  console.log('[Rendering SafeAreaView]');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (bottomNavigationBarColor && !isIOS && modifyNavigationBarColor) {
      changeNavigationBarColor(bottomNavigationBarColor);
    }
  }, [bottomNavigationBarColor, modifyNavigationBarColor]);

  const safeAreaStyle: ViewStyle = useMemo(
    () => ({
      flex: 1,
      paddingTop: isIOS ? 0 : insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: isIOS ? 0 : insets.bottom,
      backgroundColor: backgroundColor,
    }),
    [insets.top, insets.left, insets.right, insets.bottom, backgroundColor],
  );

  return (
    <View style={StyleSheet.compose(safeAreaStyle, style)} {...rest}>
      {children}
    </View>
  );
}
