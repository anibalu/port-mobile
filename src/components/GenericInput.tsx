import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  ViewStyle,
} from 'react-native';

import {NAME_LENGTH_LIMIT} from '@configs/constants';

import {PortColors} from './ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from './NumberlessText';

const GenericInput = ({
  text,
  setText,
  inputStyle,
  size = 'md',
  alignment = 'center',
  maxLength = NAME_LENGTH_LIMIT,
  showLimit = false,
  ...rest
}: {
  text: string;
  setText?: any;
  size?: 'sm' | 'md';
  inputStyle?: ViewStyle | StyleProp<ViewStyle>;
  alignment?: 'center' | 'left' | 'right';
  maxLength?: number | 'inf';
  showLimit?: boolean;
} & TextInputProps) => {
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
            showLimit && {height: 96, paddingBottom: 25},
          ],
          inputStyle,
        )}
        maxLength={maxLength === 'inf' ? undefined : maxLength}
        textAlign={alignment}
        placeholderTextColor={PortColors.primary.grey.medium}
        onChangeText={onChangeText}
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
