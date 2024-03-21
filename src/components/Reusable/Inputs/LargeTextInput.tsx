//@sumaanta
/**
 * Large Text Input.
 * Takes the following props:
 * 1. Input value state and setter function
 * 2. Max length
 * 3. Placeholder text
 * 4. Show limit
 */

import {PortColors} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {NAME_LENGTH_LIMIT} from '@configs/constants';
import React, {useState} from 'react';
import {StyleSheet, TextInput} from 'react-native';

const LargeTextInput = ({
  text,
  setText,
  maxLength = NAME_LENGTH_LIMIT,
  placeholderText = 'Type here..',
  showLimit,
  bgColor = 'w',
  ...rest
}: {
  text: string;
  placeholderText?: string;
  setText: (text: string) => void;
  maxLength?: number | 'inf';
  showLimit?: boolean;
  bgColor?: 'w' | 'g';
}) => {
  const onTextChange = (newText: string) => {
    setText(newText);
  };
  const [isFocused, setIsFocused] = useState(false);

  return (
    <>
      <>
        <TextInput
          style={StyleSheet.compose(styles.inputText, {
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
          multiline
          placeholder={placeholderText}
          maxLength={maxLength === 'inf' ? undefined : maxLength}
          placeholderTextColor={PortColors.primary.grey.medium}
          onChangeText={onTextChange}
          value={text}
          {...rest}
        />
        {showLimit && (
          <NumberlessText
            fontType={FontType.rg}
            fontSizeType={FontSizeType.s}
            textColor={PortColors.text.secondary}
            style={styles.inputCounterStyle}>
            {text.length}/{maxLength}
          </NumberlessText>
        )}
      </>
    </>
  );
};

const styles = StyleSheet.create({
  inputText: {
    height: 120,
    alignSelf: 'stretch',
    color: PortColors.primary.grey.dark,
    backgroundColor: PortColors.primary.grey.light,
    borderRadius: 16,
    padding: 16,
  },
  inputCounterStyle: {
    alignSelf: 'flex-end',
    top: -24,
    right: 15,
  },
});

export default LargeTextInput;
