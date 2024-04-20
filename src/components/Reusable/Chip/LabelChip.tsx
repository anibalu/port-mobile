/**
 * LabelChip that displays on chatTile
 * Takes the following props:
 * 1. text - string
 * 2. textColor - string
 * 3. bgColor - string
 */

import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React from 'react';
import {StyleSheet, View} from 'react-native';

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
        fontType={FontType.rg}
        textColor={textColor}>
        {text}
      </NumberlessText>
    </View>
  );
};

const styles = StyleSheet.create({
  chipContainer: {
    textAlign: 'center',
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 4,
  },
});

export default LabelChip;
