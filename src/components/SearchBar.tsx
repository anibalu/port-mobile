import React, {memo, useState} from 'react';
import {Pressable, StyleSheet, TextInput, View} from 'react-native';

import {NAME_LENGTH_LIMIT} from '@configs/constants';

import useDynamicSVG from '@utils/Themes/createDynamicSVG';

import SearchGrey from '@assets/icons/GreySearch.svg';

import {PortSpacing} from './ComponentUtils';
import DynamicColors from './DynamicColors';

const SearchBar = ({
  searchText,
  setSearchText,
  style,
  placeholder = 'Search',
}: {
  searchText: string;
  setSearchText: any;
  style?: any;
  placeholder?: string;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const onChangeText = (newName: string) => {
    setIsFocused(true);
    setSearchText(newName);
    if (newName === '') {
      setIsFocused(false);
    }
  };
  const Colors = DynamicColors();
  const svgArray = [
    {
      assetName: 'CloseIcon',
      light: require('@assets/light/icons/Close.svg').default,
      dark: require('@assets/dark/icons/Close.svg').default,
    },
    {
      assetName: 'SearchIcon',
      light: require('@assets/light/icons/search.svg').default,
      dark: require('@assets/dark/icons/search.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const CloseIcon = results.CloseIcon;
  const SearchIcon = results.SearchIcon;

  return (
    <View style={[styles.searchBarStyle, style]}>
      {isFocused ? (
        <SearchIcon height={20} width={20} />
      ) : (
        <SearchGrey height={20} width={20} />
      )}
      <TextInput
        style={{
          marginLeft: PortSpacing.tertiary.left,
          flex: 1,
          fontSize: 15,
          color: Colors.text.primary,
        }}
        textAlign="left"
        maxLength={NAME_LENGTH_LIMIT}
        placeholder={isFocused ? '' : placeholder}
        placeholderTextColor={Colors.text.placeholder}
        onChangeText={onChangeText}
        value={searchText}
        onBlur={() => setIsFocused(false)}
      />
      {searchText.length > 0 && (
        <Pressable hitSlop={40} onPress={() => onChangeText('')}>
          <CloseIcon height={18} width={18} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarStyle: {
    width: '100%',
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 16,
    height: 46,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default memo(SearchBar);
