import React, {FC} from 'react';
import {StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';

import {SvgProps} from 'react-native-svg';

import {useColors} from '@components/colorGuide';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import {Size, Spacing} from '@components/spacingGuide';
import useSVG from '@components/svgGuide';

/**
 * A reusable component that renders a touchable option with:
 * - A left icon (optional)
 * - Title text
 * - Right chevron icon
 *
 * Used for clickable menu items and options throughout the app.
 *
 * @param onClick - Function called when option is pressed
 * @param IconLeft - Optional left icon component
 * @param IconLeftSize - Size of the left icon (defaults to Size.xl)
 * @param IconLeftParentStyle - Optional style for left icon container
 * @param title - Main text shown
 * @param forceTheme - Optional override of light/dark theme
 */
const OptionWithLogoAndChevronWithoutDescription = ({
  onClick,
  IconLeft,
  IconLeftSize = Size.l,
  IconLeftParentStyle,
  title,
  forceTheme,
}: {
  onClick: () => void;
  IconLeft?: FC<SvgProps>;
  IconLeftSize?: number;
  IconLeftParentStyle?: ViewStyle;
  title?: string;
  forceTheme?: 'light' | 'dark';
}) => {
  const Colors = useColors(forceTheme);

  const svgArray = [
    {
      assetName: 'RightChevron',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];

  const results = useSVG(svgArray, forceTheme);
  const IconRight = results.RightChevron;
  return (
    <>
      <TouchableOpacity
        onPress={onClick}
        activeOpacity={0.7}
        style={styles.optionMainContainer}>
        {IconLeft && (
          <View
            style={StyleSheet.compose(styles.IconParent, IconLeftParentStyle)}>
            <IconLeft height={IconLeftSize} width={IconLeftSize} />
          </View>
        )}
        <View style={styles.TextContainer}>
          <NumberlessText
            textColor={Colors.text.title}
            fontSizeType={FontSizeType.l}
            fontWeight={FontWeight.rg}>
            {title}
          </NumberlessText>
        </View>
        {IconRight && <IconRight width={20} height={20} />}
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  IconParent: {
    borderRadius: 12,
  },
  TextContainer: {
    gap: 2,
    flex: 1,
    paddingHorizontal: Spacing.m,
  },
  optionMainContainer: {
    paddingVertical: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default OptionWithLogoAndChevronWithoutDescription;
