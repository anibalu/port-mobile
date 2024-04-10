/**
 * Option With Toggle.
 * Takes the following props:
 * 1. On toggle function
 * 2. Icon Left
 * 3. Active/Inactive state
 * 4. Desc Text (optional)
 * 5. Has border bottom
 */

import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {FC} from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {View} from 'react-native';
import {SvgProps} from 'react-native-svg';
import ToggleSwitch from 'toggle-switch-react-native';

const OptionWithToggle = ({
  onToggle,
  IconLeft,
  toggleActiveState = false,
  heading,
  description,
}: {
  onToggle: () => Promise<void>;
  IconLeft: FC<SvgProps>;
  toggleActiveState: boolean;
  heading: string;
  description?: string;
}) => {
  return (
    <TouchableOpacity
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
        <ToggleSwitch
          isOn={toggleActiveState}
          onColor={PortColors.primary.blue.app}
          offColor={PortColors.background}
          onToggle={onToggle}
        />
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
    flex: 1,
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
    marginRight: PortSpacing.secondary.uniform + 46,
  },
});

export default OptionWithToggle;
