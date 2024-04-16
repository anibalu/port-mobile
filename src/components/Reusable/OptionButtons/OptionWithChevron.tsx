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
} from '@components/NumberlessText';
import React, {FC} from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
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
      onPress={onClick}
      style={styles.optionWrapper}
      accessibilityIgnoresInvertColors
      activeOpacity={0.6}>
      <View style={styles.topContainer}>
        <IconLeft height={20} width={20} />
        <NumberlessText
          textColor={PortColors.title}
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
      {description && (
        <NumberlessText
          textColor={PortColors.subtitle}
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

const styles = StyleSheet.create({
  optionWrapper: {
    flexDirection: 'column',
    paddingHorizontal: PortSpacing.secondary.uniform,
    paddingVertical: 10,
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
    alignItems: 'center',
    height: 25,
    backgroundColor: PortColors.background,
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
