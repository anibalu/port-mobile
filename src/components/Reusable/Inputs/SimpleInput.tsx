/**
 * Simple Input.
 * Takes the following props:
 * 1. Input value state and setter function
 * 2. Max length
 * 3. Placeholder text
 */

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {FontSizeType, FontType, getWeight} from '@components/NumberlessText';
import {NAME_LENGTH_LIMIT} from '@configs/constants';
import React, {useState} from 'react';
import {KeyboardTypeOptions, StyleSheet, TextInput} from 'react-native';
import {useTheme} from 'src/context/ThemeContext';

const SimpleInput = ({
  text,
  setText,
  maxLength = NAME_LENGTH_LIMIT,
  placeholderText = 'Type here..',
  bgColor = 'w',
  keyboardType = 'ascii-capable',
}: {
  text: string;
  placeholderText?: string;
  setText: (text: string) => void;
  maxLength?: number | 'inf';
  bgColor?: 'w' | 'g';
  keyboardType?: KeyboardTypeOptions;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const onTextChange = (newText: string) => {
    setText(newText);
  };
  const Colors = DynamicColors();

  const {themeValue} = useTheme();

  return (
    <>
      <TextInput
        style={StyleSheet.compose(styles.textInput, {
          color: Colors.text.primary,
          borderColor: isFocused
            ? Colors.primary.accent
            : Colors.primary.stroke,
          backgroundColor:
            bgColor && bgColor === 'g'
              ? Colors.primary.lightgrey
              : themeValue === 'dark'
              ? Colors.primary.surface
              : Colors.primary.white,
        })}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholderText}
        placeholderTextColor={Colors.primary.mediumgrey}
        maxLength={maxLength === 'inf' ? undefined : maxLength}
        value={text}
        onChangeText={onTextChange}
        keyboardType={keyboardType}
      />
    </>
  );
};

const styles = StyleSheet.create({
  textInput: {
    padding: PortSpacing.secondary.uniform,
    alignSelf: 'stretch',
    borderWidth: 1,
    fontFamily: FontType.rg,
    fontSize: FontSizeType.m,
    fontWeight: getWeight(FontType.rg),
    borderRadius: 12,
    height: 50,
  },
});

export default SimpleInput;
