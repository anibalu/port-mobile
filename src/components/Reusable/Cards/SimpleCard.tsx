/**
 * Simple Card.
 * Takes no props.
 */

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import React from 'react';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {View} from 'react-native';
const SimpleCard = ({
  children,
  style,
}: {
  children?: any;
  style?: ViewStyle | StyleProp<ViewStyle>;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <View style={StyleSheet.compose(styles.cardContainer, style)}>
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
