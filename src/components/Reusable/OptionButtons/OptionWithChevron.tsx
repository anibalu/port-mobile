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

import {PortColors, PortSpacing} from '@components/ComponentUtils';
import RightChevron from '@assets/icons/BlackAngleRight.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from '@components/NumberlessText';
import React, {FC} from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {View} from 'react-native';
import {SvgProps} from 'react-native-svg';

const OptionWithChevron = ({
  onClick,
  IconLeft,
  labelText,
  labelActiveState = false,
  heading,
  description,
}: {
  onClick: () => void;
  IconLeft: FC<SvgProps>;
  labelText?: string;
  labelActiveState: boolean;
  heading: string;
  description?: string;
}) => {
  return (
    <TouchableOpacity
      style={StyleSheet.compose(styles.optionContainer, {
        height: description ? 67 : 40,
      })}
      onPress={onClick}
      accessibilityIgnoresInvertColors
      activeOpacity={0.6}>
      <View style={styles.optionWrapper}>
        <IconLeft height={20} width={20} />
        <View style={styles.textContainer}>
          <Text numberOfLines={1} style={styles.heading}>
            {heading}
          </Text>
          <Text numberOfLines={2} style={styles.description}>
            {description}
          </Text>
        </View>

        <View style={styles.sectionRight}>
          {labelText && (
            <View style={styles.labelWrapper}>
              <NumberlessText
                fontType={FontType.rg}
                fontSizeType={FontSizeType.m}
                textColor={
                  labelActiveState
                    ? PortColors.primary.blue.app
                    : PortColors.subtitle
                }>
                {labelText}
              </NumberlessText>
            </View>
          )}

          <RightChevron width={20} height={20} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  optionContainer: {
    paddingHorizontal: 16,
  },
  optionWrapper: {
    flexDirection: 'row',
    paddingTop: PortSpacing.tertiary.bottom + 2,
    paddingBottom: PortSpacing.tertiary.bottom,
    alignItems: 'flex-start',
    flex: 1,
  },
  labelWrapper: {
    borderRadius: 6,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 25,
    backgroundColor: PortColors.background,
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 20,
  },
  textContainer: {
    paddingLeft: 16,
    paddingRight: 5,
    flexDirection: 'column',
    flex: 1,
  },
  heading: {
    lineHeight: 20,
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

export default OptionWithChevron;
