/**
 * Option With Left Icon
 * Takes the following props:
 * 1. On click function
 * 2. Icon Left
 * 3. title text
 * 4. Desc Text (optional)
 */

import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {FontSizeType, FontType, getWeight} from '@components/NumberlessText';
import React, {FC} from 'react';
import {StyleSheet, Text, TouchableOpacity,View} from 'react-native';
import {SvgProps} from 'react-native-svg';

const OptionWithLeftIcon = ({
  onClick = () => {},
  IconLeft,
  title,
  description,
}: {
  onClick?: () => void;
  IconLeft?: FC<SvgProps>;
  title: string;
  description?: string;
}) => {
  return (
    <TouchableOpacity
      style={StyleSheet.compose(styles.optionContainer, {
        height: description ? 67 : 38,
      })}
      onPress={onClick}
      accessibilityIgnoresInvertColors
      activeOpacity={0.6}>
      <View style={styles.iconContainer}>
        {IconLeft && <IconLeft height={20} width={20} />}
      </View>
      <View style={styles.textContainer}>
        <Text numberOfLines={1} style={styles.heading}>
          {title}
        </Text>
        <Text numberOfLines={2} style={styles.description}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  optionContainer: {
    paddingHorizontal: 16,
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 8,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  textContainer: {
    flexDirection: 'column',
  },
  iconContainer: {
    marginRight: PortSpacing.tertiary.right,
  },
  heading: {
    lineHeight: 22,
    paddingBottom: 2,
    color: PortColors.title,
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

export default OptionWithLeftIcon;
