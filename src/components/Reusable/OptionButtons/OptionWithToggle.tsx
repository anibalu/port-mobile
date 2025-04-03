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
import {StyleSheet} from 'react-native';
import {View} from 'react-native';
import {SvgProps} from 'react-native-svg';
import ToggleSwitch from 'toggle-switch-react-native';

const OptionWithToggle = ({
  onToggle,
  IconLeft,
  toggleActiveState = false,
  heading,
  _description,
  boldTitle = false,
  backgroundColor,
  borderColorEnabled,
}: {
  onToggle: () => void;
  IconLeft?: FC<SvgProps>;
  toggleActiveState: boolean;
  heading: string;
  _description?: string;
  boldTitle?: boolean;
  backgroundColor?: string;
  borderColorEnabled?: boolean;
}) => {
  const Colors = DynamicColors();
  return (
    <View style={styles.optionWrapper} accessibilityIgnoresInvertColors>
      <View style={styles.topContainer}>
        {IconLeft && (
          <View
            style={{
              backgroundColor: backgroundColor,
              borderWidth: 0.5,
              borderRadius: 100,
              padding: 4,
              borderColor: borderColorEnabled
                ? 'transparent'
                : Colors.primary.darkgrey,
            }}>
            <IconLeft height={20} width={20} />
          </View>
        )}

        <NumberlessText
          textColor={Colors.text.primary}
          numberOfLines={1}
          fontSizeType={FontSizeType.m}
          fontType={boldTitle ? FontType.sb : FontType.rg}
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
      {/* {description && (
        <NumberlessText
          textColor={Colors.text.subtitle}
          numberOfLines={2}
          fontSizeType={FontSizeType.s}
          fontType={FontType.rg}
          style={styles.description}>
          {description}
        </NumberlessText>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  optionWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: PortSpacing.intermediate.uniform,
    width: '100%',
    height: 48,
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
    marginRight: PortSpacing.secondary.uniform + 46,
  },
});

export default OptionWithToggle;
