//@sumaanta
/**
 * Large Text Input.
 * Takes the following props:
 * 1. Input value state and setter function
 * 2. Max length
 * 3. Placeholder text
 * 4. Show limit
 */

import React, {useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';

import { useColors } from '@components/colorGuide';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import { Spacing } from '@components/spacingGuide';

import {NAME_LENGTH_LIMIT} from '@configs/constants';

const LargeTextInput = ({
  text,
  setText,
  maxLength = NAME_LENGTH_LIMIT,
  placeholderText = 'Type here..',
  showLimit,
  bgColor = 'w',
  scrollToFocus = () => {},
  isEditable = true,
}: {
  text: string;
  placeholderText?: string;
  setText: (text: string) => void;
  maxLength?: number | 'inf';
  showLimit?: boolean;
  bgColor?: 'w' | 'g';
  scrollToFocus?: any;
  isEditable?: boolean;
}) => {
  const onTextChange = (newText: string) => {
    setText(newText);
  };
  const [isFocused, setIsFocused] = useState(false);

  const Colors = useColors();
  const styles = styling(Colors);

  return (
    <View style={{
      borderRadius: 12,
      overflow: 'hidden',
      paddingTop: Spacing.s,
      paddingBottom: Spacing.xl,
      borderWidth: 0.5,
      ...{
        borderColor: isEditable
          ? isFocused
            ? Colors.boldAccentColors.purple
            : Colors.stroke
          : undefined,
          backgroundColor:
          bgColor && bgColor === 'g' ? Colors.background : Colors.surface,
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
        placeholderTextColor={Colors.text.subtitle}
        onChangeText={onTextChange}
        textAlignVertical="top"
        editable={isEditable}
        value={text}
      />
      {showLimit && (
        <NumberlessText
          fontWeight={FontWeight.rg}
          fontSizeType={FontSizeType.s}
          textColor={Colors.text.subtitle}
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
      paddingVertical: 0,
      paddingHorizontal: Spacing.l,
      alignSelf: 'stretch',
      fontSize: FontSizeType.l,
      fontWeight: FontWeight.rg,
      color: colors.text.title,
      height: 150,
    },
    inputCounterStyle: {
      position: 'absolute',
      bottom: Spacing.s,
      right: 16,
    },
  });

export default LargeTextInput;
