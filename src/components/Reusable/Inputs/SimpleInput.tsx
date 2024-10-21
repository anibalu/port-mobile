/**
 * Simple Input.
 * Takes the following props:
 * 1. Input value state and setter function
 * 2. Max length
 * 3. Placeholder text
 */

import DynamicColors from '@components/DynamicColors';
import {FontType} from '@components/NumberlessText';
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
  isEditable = true,
}: {
  isEditable?: boolean;
  text: string;
  placeholderText?: string;
  setText: (text: string) => void;
  maxLength?: number | 'inf';
  bgColor?: 'w' | 'g';
  keyboardType?: KeyboardTypeOptions;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const onTextChange = (newText: string) => {
    if (keyboardType === 'numeric') {
      const numericText = newText.replace(/[^0-9]/g, '');
      setText(numericText);
    } else {
      setText(newText);
    }
  };

  const Colors = DynamicColors();

  const {themeValue} = useTheme();

  return (
    <>
      <TextInput
        editable={isEditable}
        style={StyleSheet.compose(styles.textInput, {
          color: Colors.text.primary,
          borderColor: isFocused
            ? Colors.primary.accent
            : Colors.primary.stroke,
          backgroundColor:
            bgColor && bgColor === 'g'
              ? Colors.primary.background
              : themeValue === 'dark'
              ? Colors.primary.surface
              : Colors.primary.white,
        })}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholderText}
        placeholderTextColor={Colors.text.placeholder}
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
    paddingHorizontal: 16,
    alignSelf: 'stretch',
    fontFamily: FontType.rg,
    fontSize: 15,
    fontWeight: '400',
    borderRadius: 12,
    height: 46,
    borderWidth: 1,
  },
});

export default SimpleInput;
