/**
 * Option With Radio.
 * Takes the following props:
 * 1. On click function
 * 2. Active/Inactive state
 * 4. Title text
 */

import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {View} from 'react-native';
import RadioOn from '@assets/icons/RadioOn.svg';
import RadioOff from '@assets/icons/RadioOff.svg';

const OptionWithRadio = ({
  onClick,
  selectedOption,
  selectedOptionComparision,
  title,
}: {
  onClick: () => Promise<void>;
  selectedOptionComparision: any;
  selectedOption: number | string;
  title: string;
}) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      accessibilityIgnoresInvertColors
      activeOpacity={0.6}>
      <View style={styles.optionContainer}>
        <View style={styles.optionWrapper}>
          <View style={styles.textContainer}>
            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}>
              {title}
            </NumberlessText>
          </View>
          <View>
            {selectedOption === selectedOptionComparision ? (
              <RadioOn width={20} height={20} />
            ) : (
              <RadioOff width={20} height={20} />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  optionContainer: {
    paddingHorizontal: PortSpacing.secondary.uniform,
    height: 40,
  },
  optionWrapper: {
    flexDirection: 'row',
    paddingVertical: PortSpacing.tertiary.uniform,
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    paddingRight: 5,
    flexDirection: 'column',
    flex: 1,
  },
});

export default OptionWithRadio;
