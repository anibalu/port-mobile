/**
 * Search Input.
 * Takes the following props:
 * 1. text value
 * 2. set text functiob
 */

import {PortColors, PortSpacing} from '@components/ComponentUtils';
import SearchIcon from '@assets/icons/searchThin.svg';
import BlackCross from '@assets/icons/BlackCross.svg';
import {FontSizeType, FontType, getWeight} from '@components/NumberlessText';
import {NAME_LENGTH_LIMIT} from '@configs/constants';
import React, {useState} from 'react';
import {Pressable, StyleSheet, TextInput, View} from 'react-native';

const SearchInput = ({
  text,
  setText,
}: {
  text: string;
  placeholderText?: string;
  setText: (text: string) => void;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const onTextChange = (newText: string) => {
    setText(newText);
  };

  return (
    <View
      style={StyleSheet.compose(styles.inputWrapper, {
        borderColor: isFocused
          ? PortColors.primary.blue.app
          : PortColors.stroke,
      })}>
      <SearchIcon width={20} height={20} />
      <TextInput
        autoFocus
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.textInput}
        placeholder={'Search here...'}
        placeholderTextColor={PortColors.primary.grey.medium}
        maxLength={NAME_LENGTH_LIMIT}
        value={text}
        onChangeText={onTextChange}
      />
      {text.length > 0 && (
        <Pressable onPress={() => setText('')}>
          <BlackCross width={15} height={15} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    backgroundColor: PortColors.primary.grey.light,
    marginRight: PortSpacing.secondary.right,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    fontFamily: FontType.rg,
    fontSize: FontSizeType.m,
    fontWeight: getWeight(FontType.rg),
    color: PortColors.title,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: PortSpacing.secondary.uniform,
  },
  textInput: {
    paddingLeft: PortSpacing.tertiary.left,
    flex: 1,
    fontFamily: FontType.rg,
    fontSize: FontSizeType.m,
    fontWeight: getWeight(FontType.rg),
    color: PortColors.title,
    height: 44,
  },
});

export default SearchInput;
