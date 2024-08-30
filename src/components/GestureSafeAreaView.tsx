/**
 * custom SafeAreaView for Port that uses safe insets.
 * Wrap this component around your screen so that the app handles various phone with various notches well.
 */
import React from 'react';
import {StyleSheet, ViewProps, ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {PortSpacing, isIOS} from './ComponentUtils';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import DynamicColors from './DynamicColors';

interface GestureSafeAreaViewProps extends ViewProps {
  removeOffset?: boolean;
}

export function GestureSafeAreaView({
  children,
  style,
  removeOffset = false,
  ...rest
}: GestureSafeAreaViewProps) {
  const insets = useSafeAreaInsets();
  const Colors = DynamicColors();
  const safeAreaStyle: ViewStyle = {
    flex: 1,
    backgroundColor: Colors.primary.background,
    paddingTop: isIOS ? 0 : insets.top,
    paddingLeft: insets.left,
    paddingRight: insets.right,
    paddingBottom: isIOS
      ? (!removeOffset && PortSpacing.secondary.bottom) || 0
      : insets.bottom,
  };

  return (
    <GestureHandlerRootView
      style={StyleSheet.compose(safeAreaStyle, style)}
      {...rest}>
      {children}
    </GestureHandlerRootView>
  );
}
