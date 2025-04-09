/**
 * Option With Icon.
 * Takes the following props:
 * 1. On Click function
 * 2. Icon Right
 * 3. Heading text
 * 4. Desc Text (optional)
 * 5. Has border bottom
 */

import React, {FC} from 'react';
import {StyleSheet, TouchableOpacity,View} from 'react-native';

import {SvgProps} from 'react-native-svg';

import {PortColors} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from '@components/NumberlessText';


const OptionWithRightIcon = ({
  onClick,
  IconRight,
  title,
  description,
}: {
  onClick: () => void;
  IconRight?: FC<SvgProps>;
  title: string;
  description?: string;
}) => {
  const Colors = DynamicColors();

  return (
    <TouchableOpacity
      accessibilityIgnoresInvertColors
      activeOpacity={0.6}
      style={StyleSheet.compose(styles.optionContainer, {
        height: description ? 67 : 38,
      })}
      onPress={onClick}>
      <View style={styles.textContainer}>
        <NumberlessText
          textColor={Colors.text.primary}
          numberOfLines={1}
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}
          style={styles.heading}>
          {title}
        </NumberlessText>
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
      </View>
      <View>{IconRight && <IconRight height={20} width={20} />}</View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  optionContainer: {
    paddingHorizontal: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'center',
  },
  textContainer: {
    flexDirection: 'column',
  },
  heading: {
    lineHeight: 22,
    paddingBottom: 2,
    fontFamily: FontType.rg,
    fontSize: FontSizeType.m,
    fontWeight: getWeight(FontType.rg),
  },
  description: {
    color: PortColors.subtitle,
    fontFamily: FontType.rg,
    fontSize: FontSizeType.s,
    fontWeight: getWeight(FontType.rg),
  },
});

export default OptionWithRightIcon;
