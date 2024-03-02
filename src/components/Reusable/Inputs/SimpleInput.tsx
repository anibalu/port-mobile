/**
 * Simple Input.
 * Takes the following props:
 * 1. Input value state and setter function
 * 2. Max length
 * 3. Placeholder text
 */

import {PortColors} from '@components/ComponentUtils';
import {FontSizeType, FontType, getWeight} from '@components/NumberlessText';
import {NAME_LENGTH_LIMIT} from '@configs/constants';
import React, {useState} from 'react';
import {StyleSheet, TextInput} from 'react-native';

const SimpleInput = ({
  text,
  setText,
  maxLength = NAME_LENGTH_LIMIT,
  placeholderText = 'Type here..',
  bgColor = 'w',
}: {
  text: string;
  placeholderText?: string;
  setText: (text: string) => void;
  maxLength?: number | 'inf';
  bgColor?: 'w' | 'g';
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const onTextChange = (newText: string) => {
    setText(newText);
  };

  return (
    <>
      <TextInput
        style={StyleSheet.compose(styles.textInput, {
          borderColor: isFocused
            ? PortColors.primary.blue.app
            : PortColors.stroke,
          backgroundColor:
            bgColor && bgColor === 'g'
              ? PortColors.primary.grey.light
              : PortColors.primary.white,
        })}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholderText}
        placeholderTextColor={PortColors.primary.grey.medium}
        maxLength={maxLength === 'inf' ? undefined : maxLength}
        value={text}
        onChangeText={onTextChange}
      />
    </>
  );
};

const styles = StyleSheet.create({
  textInput: {
    padding: 16,
    alignSelf: 'stretch',
    borderWidth: 1,
    fontFamily: FontType.rg,
    fontSize: FontSizeType.m,
    fontWeight: getWeight(FontType.rg),
    color: PortColors.title,
    borderRadius: 12,
    height: 50,
  },
});

export default SimpleInput;
