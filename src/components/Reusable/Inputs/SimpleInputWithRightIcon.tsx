import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {FontType} from '@components/NumberlessText';
import {NAME_LENGTH_LIMIT} from '@configs/constants';
import React, {FC} from 'react';
import {KeyboardTypeOptions, StyleSheet, TextInput, View} from 'react-native';
import {SvgProps} from 'react-native-svg';

/**
 * Simple Input with Right Icon component
 * @param text - The text to display in the input
 * @param setText - The function to set the text in the input
 * @param maxLength - The maximum length of the input
 * @param placeholderText - The placeholder text to display in the input
 * @param keyboardType - The type of keyboard to display
 */

const SimpleInputWithRightIcon = ({
  text,
  setText,
  maxLength = NAME_LENGTH_LIMIT,
  placeholderText = 'Type here..',
  keyboardType = 'ascii-capable',
  isEditable = true,
  RightIcon,
}: {
  isEditable?: boolean;
  text: string;
  placeholderText?: string;
  setText: (text: string) => void;
  maxLength?: number | 'inf';
  keyboardType?: KeyboardTypeOptions;
  RightIcon?: FC<SvgProps>;
}) => {
  // function to handle the text change
  const onTextChange = (newText: string) => {
    if (keyboardType === 'numeric') {
      const numericText = newText.replace(/[^0-9]/g, '');
      setText(numericText);
    } else {
      setText(newText);
    }
  };

  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <View style={styles.container}>
      <TextInput
        editable={isEditable}
        style={StyleSheet.compose(styles.textInput, {
          color: Colors.primary.accent,
        })}
        placeholder={placeholderText}
        placeholderTextColor={Colors.text.placeholder}
        maxLength={maxLength === 'inf' ? undefined : maxLength}
        value={text}
        onChangeText={onTextChange}
        keyboardType={keyboardType}
      />
      {RightIcon && <RightIcon />}
    </View>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    textInput: {
      paddingHorizontal: 16,
      fontFamily: FontType.rg,
      fontSize: 15,
      fontWeight: '400',
    },
    container: {
      borderWidth: 1,
      borderColor: Colors.primary.stroke,
      borderRadius: 24,
      alignSelf: 'stretch',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: PortSpacing.secondary.bottom,
    },
  });

export default SimpleInputWithRightIcon;
