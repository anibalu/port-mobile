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
import React from 'react';
import {KeyboardTypeOptions, StyleSheet, TextInput} from 'react-native';
import {useTheme} from 'src/context/ThemeContext';

const InputWithoutBorder = ({
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
  const onTextChange = (newText: string) => {
    setText(newText);
  };
  const Colors = DynamicColors();

  const {themeValue} = useTheme();

  return (
    <>
      <TextInput
        editable={isEditable}
        style={StyleSheet.compose(styles.textInput, {
          color: Colors.text.primary,

          backgroundColor:
            bgColor && bgColor === 'g'
              ? Colors.primary.background
              : themeValue === 'dark'
              ? Colors.primary.surface2
              : Colors.primary.white,
        })}
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
  },
});

export default InputWithoutBorder;
