import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {View} from 'react-native';
import {useColors} from '@components/colorGuide';
import useSVG from '@components/svgGuide';
import {Spacing} from '@components/spacingGuide';

/**
 * Option With Radio.
 * Takes the following props:
 * 1. On click function
 * 2. Active/Inactive state
 * 4. Title text
 *
 * @param onClick - On click function
 * @param selectedOption - Active/Inactive state
 * @param selectedOptionComparision - Active/Inactive state
 * @param title - Title text
 * @param forceTheme - Theme
 * @returns OptionWithRadio component
 */
const OptionWithRadio = ({
  onClick,
  selectedOption,
  selectedOptionComparision,
  title,
  forceTheme,
  separator = true,
}: {
  onClick: () => Promise<void>;
  selectedOptionComparision?: number | string | null;
  selectedOption: number | string;
  title: string;
  forceTheme?: 'light' | 'dark';
  separator?: boolean;
}) => {
  const Colors = useColors(forceTheme);
  const styles = styling(Colors);

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
  const results = useSVG(svgArray, forceTheme);
  const RadioOn = results.RadioOn;
  const RadioOff = results.RadioOff;

  return (
    <View style={styles.mainWrapper}>
      <TouchableOpacity
        onPress={onClick}
        accessibilityIgnoresInvertColors
        activeOpacity={0.7}
        style={{
          ...styles.optionWrapper,
          borderBottomWidth: separator
            ? Colors.theme === 'dark'
              ? 0.25
              : 0.5
            : 0,
        }}>
        <View style={styles.textContainer}>
          <NumberlessText
            textColor={Colors.text.title}
            fontSizeType={FontSizeType.m}
            fontWeight={FontWeight.rg}>
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
      </TouchableOpacity>
    </View>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    optionWrapper: {
      paddingVertical: Spacing.l,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomColor: Colors.stroke,
    },
    textContainer: {
      gap: 2,
      flex: 1,
    },
    mainWrapper: {
      paddingHorizontal: Spacing.l,
      flexDirection: 'column',
      width: '100%',
    },
  });

export default OptionWithRadio;
