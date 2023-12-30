import {NAME_LENGTH_LIMIT} from '@configs/constants';
import React from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  TextInput,
  ViewStyle,
} from 'react-native';
import {PortColors} from './ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from './NumberlessText';

const GenericInput = ({
  placeholder,
  text,
  multiline = false,
  setText,
  inputStyle,
  size = 'md',
  type = 'default',
  alignment = 'center',
  editable = true,
  maxLength = NAME_LENGTH_LIMIT,
  showLimit = false,
}: {
  placeholder?: string;
  text: string;
  multiline?: boolean;
  type?: KeyboardTypeOptions;
  setText?: any;
  editable?: boolean;
  size?: 'sm' | 'md';
  inputStyle?: ViewStyle;
  alignment?: 'center' | 'left' | 'right';
  maxLength?: number;
  showLimit?: boolean;
}) => {
  const onChangeText = (text: string) => {
    setText(text);
  };
  return (
    <>
      <TextInput
        style={StyleSheet.compose(
          [
            styles.inputText,
            size === 'md'
              ? {
                  fontFamily: FontType.md,
                  fontSize: FontSizeType.m,
                  fontWeight: getWeight(FontType.md),
                }
              : {
                  fontFamily: FontType.rg,
                  fontSize: FontSizeType.m,
                  fontWeight: getWeight(FontType.rg),
                },
          ],
          inputStyle,
        )}
        keyboardType={type}
        maxLength={maxLength}
        editable={editable}
        placeholder={placeholder}
        textAlign={alignment}
        multiline={multiline}
        placeholderTextColor={PortColors.primary.grey.medium}
        onChangeText={onChangeText}
        value={text}
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
  );
};

export default GenericInput;

const styles = StyleSheet.create({
  inputText: {
    height: 76,
    alignSelf: 'stretch',
    color: PortColors.primary.grey.dark,
    backgroundColor: PortColors.primary.grey.light,
    borderRadius: 16,
  },
  inputCounterStyle: {
    alignSelf: 'flex-end',
    top: -24,
    right: 22,
  },
});
