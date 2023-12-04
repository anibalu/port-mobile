import {NAME_LENGTH_LIMIT} from '@configs/constants';
import React, {useState} from 'react';
import {StyleSheet, TextInput, TextStyle, View, ViewStyle} from 'react-native';
import {FontSizes, PortColors} from './ComponentUtils';
import {NumberlessRegularText} from './NumberlessText';

const GenericInput = ({
  placeholder,
  text,
  multiline = false,
  setText,
  wrapperStyle,
  inputStyle,
  alignment = 'center',
  maxLength = NAME_LENGTH_LIMIT,
  showLimit = false,
}: {
  placeholder: string;
  text: string;
  multiline?: boolean;
  setText: any;
  wrapperStyle?: ViewStyle;
  inputStyle?: TextStyle;
  alignment?: 'center' | 'left' | 'right';
  maxLength?: number;
  showLimit?: boolean;
}) => {
  const onChangeText = (text: string) => {
    setText(text);
  };

  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={StyleSheet.compose(styles.nicknameBox, wrapperStyle)}>
      <TextInput
        style={StyleSheet.compose(styles.inputText, inputStyle)}
        maxLength={maxLength}
        placeholder={isFocused ? '' : placeholder}
        textAlign={alignment}
        multiline={multiline}
        placeholderTextColor={PortColors.primary.grey.medium}
        onChangeText={onChangeText}
        value={text}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {showLimit && (
        <View style={{position: 'absolute', bottom: 10, right: 45}}>
          <NumberlessRegularText style={styles.limitStyle}>
            {text.length}/{maxLength}
          </NumberlessRegularText>
        </View>
      )}
    </View>
  );
};

export default GenericInput;

const styles = StyleSheet.create({
  nicknameBox: {
    width: '100%',
    height: 76,
    justifyContent: 'center',
    marginTop: 30,
    // paddingLeft: '8%',
    // paddingRight: '8%',
  },
  limitStyle: {
    ...FontSizes[12].regular,
  },
  inputText: {
    ...FontSizes[15].medium,
    width: '100%',
    height: '100%',
    color: PortColors.primary.grey.dark,
    backgroundColor: PortColors.primary.grey.light,
    borderRadius: 16,
  },
});
