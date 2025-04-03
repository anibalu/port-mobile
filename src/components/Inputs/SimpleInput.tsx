import {useColors} from '@components/colorGuide';
import {FontSizeType, FontWeight} from '@components/NumberlessText';
import {Height} from '@components/spacingGuide';
import {NAME_LENGTH_LIMIT} from '@configs/constants';
import React, {useState} from 'react';
import {KeyboardTypeOptions, StyleSheet, TextInput} from 'react-native';

/**
 * A reusable text input component with dynamic theming and styling.
 *
 * @param text Current input value
 * @param setText Function to update input value
 * @param maxLength Maximum allowed characters (defaults to NAME_LENGTH_LIMIT)
 * @param placeholderText Placeholder text when empty (defaults to "Type here..")
 * @param bgColor Background color - 'w' for white/surface or 'g' for grey/background (defaults to 'w')
 * @param keyboardType Type of keyboard to display (defaults to 'ascii-capable')
 * @param isEditable Whether the input is editable (defaults to true)
 *
 * Features:
 * - Dynamic theming using useColors hook
 * - Focus state handling with border color change
 * - Numeric input sanitization for numeric keyboard type
 * - Configurable character limit
 * - Customizable placeholder and background
 */

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

  const Colors = useColors();

  return (
    <>
      <TextInput
        editable={isEditable}
        style={StyleSheet.compose(styles.textInput, {
          color: Colors.text.title,
          borderColor: isFocused
            ? Colors.boldAccentColors.purple
            : Colors.stroke,
          backgroundColor:
            bgColor && bgColor === 'g' ? Colors.background : Colors.surface,
        })}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholderText}
        placeholderTextColor={Colors.text.subtitle}
        maxLength={maxLength === 'inf' ? undefined : maxLength}
        value={text}
        onChangeText={onTextChange}
        keyboardType={keyboardType}
        multiline={false} // Restrict to single line
        numberOfLines={1} // Explicitly set to 1 line
        textAlignVertical="center" // Center text vertically
      />
    </>
  );
};

const styles = StyleSheet.create({
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    alignSelf: 'stretch',
    fontSize: FontSizeType.l,
    fontWeight: FontWeight.rg,
    borderRadius: 12,
    height: Height.inputBar,
    borderWidth: 0.5,
  },
});

export default SimpleInput;
