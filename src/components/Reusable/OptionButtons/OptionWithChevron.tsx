/**
 * Option With Chevron
 * Takes the following props:
 * 1. On click function
 * 2. Icon Left
 * 3. Label text
 * 4. Active/Inactive state
 * 5. Desc Text (optional)
 * 6. Has border bottom
 */

import React, {FC} from 'react';
import {StyleSheet, TouchableOpacity,View} from 'react-native';

import {SvgProps} from 'react-native-svg';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import useDynamicSVG from '@utils/Themes/createDynamicSVG';

import {useTheme} from 'src/context/ThemeContext';

const OptionWithChevron = ({
  onClick,
  IconLeft,
  labelText,
  labelActiveState = false,
  heading,
  description,
  IconLeftView,
}: {
  IconLeftView?: JSX.Element | null;
  onClick: () => void;
  IconLeft?: FC<SvgProps>;
  labelText?: string;
  labelActiveState: boolean;
  heading: string;
  description?: string;
}) => {
  const Colors = DynamicColors();
  const {themeValue} = useTheme();

  const svgArray = [
    // 1.NotificationOutline
    {
      assetName: 'RightChevron',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);

  const RightChevron = results.RightChevron;

  const styles = styling(Colors);
  return (
    <TouchableOpacity
      onPress={onClick}
      style={styles.optionWrapper}
      accessibilityIgnoresInvertColors
      activeOpacity={0.6}>
      <View style={styles.topContainer}>
        {IconLeft && <IconLeft height={20} width={20} />}
        {IconLeftView && IconLeftView}
        <NumberlessText
          textColor={Colors.labels.text}
          numberOfLines={1}
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}
          style={styles.heading}>
          {heading}
        </NumberlessText>
        <View style={styles.labelContainer}>
          {labelText && (
            <View style={styles.labelWrapper}>
              <NumberlessText
                fontType={FontType.rg}
                fontSizeType={FontSizeType.m}
                textColor={
                  labelActiveState
                    ? themeValue === 'light'
                      ? Colors.primary.accent
                      : Colors.primary.white
                    : Colors.text.subtitle
                }>
                {labelText}
              </NumberlessText>
              <RightChevron width={20} height={20} />
            </View>
          )}
        </View>
      </View>
      {description && (
        <NumberlessText
          textColor={Colors.text.subtitle}
          numberOfLines={2}
          fontSizeType={FontSizeType.s}
          fontType={FontType.rg}
          style={styles.description}>
          {description}
        </NumberlessText>
      )}
    </TouchableOpacity>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    optionWrapper: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingHorizontal: PortSpacing.intermediate.uniform,
      width: '100%',
      height: 48,
    },
    labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    labelWrapper: {
      borderRadius: 6,
      paddingHorizontal: 6,
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 16,
      alignItems: 'center',
      height: 25,
      backgroundColor: colors.primary.lightgrey,
    },
    topContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    heading: {
      marginHorizontal: PortSpacing.secondary.uniform,
      flex: 1,
    },
    description: {
      marginLeft: PortSpacing.secondary.uniform + 20,
      marginRight: PortSpacing.secondary.uniform + 55,
    },
  });

export default OptionWithChevron;
