import React from 'react';
import {StyleSheet, View} from 'react-native';

import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SearchInput from '@components/Reusable/Inputs/SearchInput';
const SearchBar = ({
  searchText,
  setSearchText,
  setIsSearchActive,
}: {
  searchText: string;
  setSearchText: (text: string) => void;
  setIsSearchActive: (isActive: boolean) => void;
}) => {
  const onCancelClick = () => {
    setSearchText('');
    setIsSearchActive(false);
  };
  const Colors = DynamicColors();

  return (
    <View style={styles.mainContainer}>
      <View style={styles.inputWrapper}>
        <SearchInput text={searchText} setText={setSearchText} />
      </View>
      <NumberlessText
        style={{color: Colors.text.primary}}
        onPress={onCancelClick}
        fontSizeType={FontSizeType.m}
        fontType={FontType.rg}>
        Cancel
      </NumberlessText>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
});

export default SearchBar;
