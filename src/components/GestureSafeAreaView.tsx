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
import {useInsetChecks} from './DeviceUtils';

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
  console.log('INSETS: ', insets);
  const Colors = DynamicColors();
  const {hasIosBottomNotch} = useInsetChecks();

  const safeAreaStyle: ViewStyle = {
    flex: 1,
    backgroundColor: Colors.primary.background,
    paddingTop: isIOS ? 0 : insets.top,
    paddingLeft: insets.left,
    paddingRight: insets.right,
    //if removeOffset prop is true and it is an android false we will add inset bottom, else if it is ios and has a bottom notch we will add some padding
    paddingBottom:
      isIOS && !removeOffset && hasIosBottomNotch
        ? PortSpacing.secondary.bottom
        : 0,
  };

  return (
    <GestureHandlerRootView
      style={StyleSheet.compose(safeAreaStyle, style)}
      {...rest}>
      {children}
    </GestureHandlerRootView>
  );
}
