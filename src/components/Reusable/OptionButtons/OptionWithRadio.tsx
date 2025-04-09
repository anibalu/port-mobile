/**
 * Option With Radio.
 * Takes the following props:
 * 1. On click function
 * 2. Active/Inactive state
 * 4. Title text
 */

import React from 'react';
import {StyleSheet, TouchableOpacity,View} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import useDynamicSVG from '@utils/Themes/createDynamicSVG';

/**
 * Option With Radio.
 * Takes the following props:
 * 1. On click function
 * 2. Active/Inactive state
 * 4. Title text
 * @deprecated Use OptionWithRadio in @components/Options instead
 */
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
  const Colors = DynamicColors();

  const svgArray = [
    {
      assetName: 'RadioOn',
      light: require('@assets/icons/RadioOn.svg').default,
      dark: require('@assets/dark/icons/RadioOn.svg').default,
    },
    {
      assetName: 'RadioOff',
      light: require('@assets/icons/RadioOff.svg').default,
      dark: require('@assets/dark/icons/RadioOff.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const RadioOn = results.RadioOn;
  const RadioOff = results.RadioOff;

  return (
    <TouchableOpacity
      onPress={onClick}
      accessibilityIgnoresInvertColors
      activeOpacity={0.6}>
      <View style={styles.optionWrapper}>
        <View style={styles.textContainer}>
          <NumberlessText
            textColor={Colors.text.primary}
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  optionWrapper: {
    paddingHorizontal: PortSpacing.secondary.uniform,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  textContainer: {
    paddingRight: 5,
    flexDirection: 'column',
    flex: 1,
  },
});

export default OptionWithRadio;
