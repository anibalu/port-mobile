/**
 * Option With Toggle.
 * Takes the following props:
 * 1. On toggle function
 * 2. Icon Left
 * 3. Active/Inactive state
 * 4. Desc Text (optional)
 * 5. Has border bottom
 */

import {PortColors} from '@components/ComponentUtils';
import {FontSizeType, FontType, getWeight} from '@components/NumberlessText';
import React, {FC} from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
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
  onToggle: () => void;
  IconLeft: FC<SvgProps>;
  toggleActiveState: boolean;
  heading: string;
  description?: string;
}) => {
  return (
    <TouchableOpacity accessibilityIgnoresInvertColors activeOpacity={0.6}>
      <View
        style={StyleSheet.compose(styles.optionContainer, {
          height: description ? 67 : 38,
        })}>
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
          <ToggleSwitch
            isOn={toggleActiveState}
            onColor={PortColors.primary.blue.app}
            offColor={PortColors.background}
            onToggle={onToggle}
          />
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
    paddingVertical: 8,
    alignItems: 'flex-start',
    flex: 1,
  },
  textContainer: {
    paddingLeft: 16,
    paddingRight: 5,
    flexDirection: 'column',
    flex: 1,
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

export default OptionWithToggle;
