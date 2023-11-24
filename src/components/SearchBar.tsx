import Search from '@assets/icons/GreySearch.svg';
import {NAME_LENGTH_LIMIT} from '@configs/constants';
import React, {memo, useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {PortColors} from './ComponentUtils';

const SearchBar = ({
  searchText,
  setSearchText,
  style,
}: {
  searchText: string;
  setSearchText: any;
  style?: any;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const onChangeText = (newName: string) => {
    setSearchText(newName);
  };

  return (
    <View style={style ? style : styles.searchBarStyle}>
      <Search color={'grey'} />
      <TextInput
        style={{marginLeft: 20, flex: 1}}
        textAlign="left"
        maxLength={NAME_LENGTH_LIMIT}
        placeholder={isFocused ? '' : 'Search'}
        placeholderTextColor={PortColors.primary.grey.medium}
        onChangeText={onChangeText}
        value={searchText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarStyle: {
    width: '100%',
    borderRadius: 8,
    flexDirection: 'row',
    marginTop: 4,
    paddingLeft: 20,
    height: 46,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default memo(SearchBar);
