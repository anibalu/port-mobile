//@sumaanta
/**
 * Large Text Input.
 * Takes the following props:
 * 1. Input value state and setter function
 * 2. Max length
 * 3. Placeholder text
 * 4. Show limit
 */

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from '@components/NumberlessText';
import {NAME_LENGTH_LIMIT} from '@configs/constants';
import React, {useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';

const LargeTextInput = ({
  text,
  setText,
  maxLength = NAME_LENGTH_LIMIT,
  placeholderText = 'Type here..',
  showLimit,
  bgColor = 'w',
  scrollToFocus = () => {},
}: {
  text: string;
  placeholderText?: string;
  setText: (text: string) => void;
  maxLength?: number | 'inf';
  showLimit?: boolean;
  bgColor?: 'w' | 'g';
  scrollToFocus?: any;
}) => {
  const onTextChange = (newText: string) => {
    setText(newText);
  };
  const [isFocused, setIsFocused] = useState(false);

  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <View
      style={{
        borderWidth: 1,
        borderRadius: 12,
        overflow: 'hidden',
        paddingTop: PortSpacing.tertiary.top,
        paddingBottom: PortSpacing.intermediate.bottom,
        ...{
          borderColor: isFocused
            ? Colors.primary.accent
            : Colors.primary.stroke,
          backgroundColor:
            bgColor && bgColor === 'g'
              ? Colors.primary.mediumgrey
              : Colors.primary.surface,
        },
      }}>
      <TextInput
        style={styles.inputText}
        onFocus={async () => {
          setIsFocused(true);
          await scrollToFocus();
        }}
        onBlur={() => setIsFocused(false)}
        multiline
        placeholder={placeholderText}
        maxLength={maxLength === 'inf' ? undefined : maxLength}
        placeholderTextColor={Colors.primary.mediumgrey}
        onChangeText={onTextChange}
        textAlignVertical="top"
        value={text}
      />
      {showLimit && (
        <NumberlessText
          fontType={FontType.rg}
          fontSizeType={FontSizeType.s}
          textColor={Colors.primary.mediumgrey}
          style={styles.inputCounterStyle}>
          {text.length}/{maxLength}
        </NumberlessText>
      )}
    </View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    inputText: {
      alignSelf: 'stretch',
      fontFamily: FontType.rg,
      fontSize: FontSizeType.m,
      fontWeight: getWeight(FontType.rg),
      color: colors.text.subtitle,
      maxHeight: 100,
      height: undefined,
      minHeight: 100,
      paddingHorizontal: 16,
    },
    inputCounterStyle: {
      position: 'absolute',
      bottom: PortSpacing.tertiary.bottom,
      right: 16,
    },
  });

export default LargeTextInput;
