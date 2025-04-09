/**
 * Simple Card.
 * Takes no props.
 */

import React from 'react';
import {StyleProp, StyleSheet, View,ViewStyle} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
const SimpleCard = ({
  children,
  style,
  pointerEvents,
}: {
  children?: any;
  style?: ViewStyle | StyleProp<ViewStyle>;
  pointerEvents?: 'auto' | 'box-none' | 'none' | 'box-only';
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <View
      style={StyleSheet.compose(styles.cardContainer, style)}
      pointerEvents={pointerEvents}>
      {children}
    </View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    cardContainer: {
      paddingVertical: PortSpacing.tertiary.uniform,
      backgroundColor: colors.primary.surface,
      borderRadius: 16,
    },
  });
export default SimpleCard;
