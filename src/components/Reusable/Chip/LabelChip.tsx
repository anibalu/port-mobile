/**
 * LabelChip that displays on chatTile
 * Takes the following props:
 * 1. text - string
 * 2. textColor - string
 * 3. bgColor - string
 */

import React from 'react';
import {StyleSheet, View} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

const LabelChip = ({
  text,
  textColor,
  bgColor,
}: {
  text: string | null;
  textColor: string;
  bgColor: string;
}) => {
  if (!text) {
    return;
  }
  return (
    <View
      style={StyleSheet.compose(styles.chipContainer, {
        backgroundColor: bgColor,
      })}>
      <NumberlessText
        ellipsizeMode="tail"
        numberOfLines={1}
        fontSizeType={FontSizeType.s}
        fontType={FontType.md}
        textColor={textColor}>
        {text}
      </NumberlessText>
    </View>
  );
};

const styles = StyleSheet.create({
  chipContainer: {
    textAlign: 'center',
    borderRadius: PortSpacing.tertiary.uniform,
    paddingVertical: 1,
    paddingHorizontal: 6,
  },
});

export default LabelChip;
