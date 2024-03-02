/**
 * Option With Icon.
 * Takes the following props:
 * 1. On Click function
 * 2. Icon Right
 * 3. Heading text
 * 4. Desc Text (optional)
 * 5. Has border bottom
 */

import {PortColors} from '@components/ComponentUtils';
import {FontSizeType, FontType, getWeight} from '@components/NumberlessText';
import React, {FC} from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {View} from 'react-native';
import {SvgProps} from 'react-native-svg';

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
  return (
    <TouchableOpacity
      accessibilityIgnoresInvertColors
      activeOpacity={0.6}
      style={StyleSheet.compose(styles.optionContainer, {
        height: description ? 67 : 38,
      })}
      onPress={onClick}>
      <View style={styles.textContainer}>
        <Text numberOfLines={1} style={styles.heading}>
          {title}
        </Text>
        {description && (
          <Text numberOfLines={2} style={styles.description}>
            {description}
          </Text>
        )}
      </View>
      <View style={styles.iconContainer}>
        {IconRight && <IconRight height={20} width={20} />}
      </View>
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
  iconContainer: {},
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

export default OptionWithRightIcon;
