/**
 * Simple Card.
 * Takes no props.
 */

import {PortColors} from '@components/ComponentUtils';
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
  return (
    <View style={StyleSheet.compose(styles.cardContainer, style)}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingVertical: 8,
    width: '100%',
    borderColor: PortColors.stroke,
    borderWidth: 0.5,
    backgroundColor: PortColors.primary.white,
    borderRadius: 16,
  },
});

export default SimpleCard;
