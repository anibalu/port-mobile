/**
 * Search Input.
 * Takes the following props:
 * 1. text value
 * 2. set text function
 */

import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {FontSizeType, FontType, getWeight} from '@components/NumberlessText';
import {NAME_LENGTH_LIMIT} from '@configs/constants';
import React, {useState} from 'react';
import {Pressable, StyleSheet, TextInput, View} from 'react-native';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import DynamicColors from '@components/DynamicColors';

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

  const Colors = DynamicColors();
  const styles = styling(Colors);

  const svgArray = [
    {
      assetName: 'SearchIcon',
      light: require('@assets/light/icons/search.svg').default,
      dark: require('@assets/dark/icons/search.svg').default,
    },
    {
      assetName: 'CloseIcon',
      light: require('@assets/light/icons/Close.svg').default,
      dark: require('@assets/dark/icons/Close.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const SearchIcon = results.SearchIcon;
  const CloseIcon = results.CloseIcon;

  return (
    <View
      style={StyleSheet.compose(styles.inputWrapper, {
        borderColor: isFocused ? Colors.primary.accent : PortColors.stroke,
      })}>
      <SearchIcon width={20} height={20} />
      <TextInput
        autoFocus
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.textInput}
        placeholder={'Search here...'}
        placeholderTextColor={Colors.text.placeholder}
        maxLength={NAME_LENGTH_LIMIT}
        value={text}
        onChangeText={onTextChange}
      />
      {text.length > 0 && (
        <Pressable onPress={() => setText('')}>
          <CloseIcon width={15} height={15} />
        </Pressable>
      )}
    </View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    inputWrapper: {
      backgroundColor: colors.primary.background,
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
      color: colors.text.primary,
      height: 44,
    },
  });

export default SearchInput;
