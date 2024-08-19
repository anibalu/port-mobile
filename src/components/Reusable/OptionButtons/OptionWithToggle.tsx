/**
 * Option With Toggle.
 * Takes the following props:
 * 1. On toggle function
 * 2. Icon Left
 * 3. Active/Inactive state
 * 4. Desc Text (optional)
 * 5. Has border bottom
 */

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
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
  IconLeftView,
  toggleActiveState = false,
  heading,
  description,
}: {
  IconLeftView?: JSX.Element | null;
  onToggle: () => void;
  IconLeft?: FC<SvgProps>;
  toggleActiveState: boolean;
  heading: string;
  description?: string;
}) => {
  const Colors = DynamicColors();
  return (
    <TouchableOpacity
      style={styles.optionWrapper}
      accessibilityIgnoresInvertColors
      activeOpacity={0.6}>
      <View style={styles.topContainer}>
        {IconLeft && <IconLeft height={20} width={20} />}
        {IconLeftView && IconLeftView}
        <NumberlessText
          textColor={Colors.text.primary}
          numberOfLines={1}
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}
          style={styles.heading}>
          {heading}
        </NumberlessText>
        <ToggleSwitch
          isOn={toggleActiveState}
          onColor={Colors.primary.darkGreen}
          offColor={Colors.primary.lightgrey}
          onToggle={onToggle}
        />
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
