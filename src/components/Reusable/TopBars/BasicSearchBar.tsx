import React, {useRef, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {FontSizeType, FontType, getWeight} from '@components/NumberlessText';
import SearchIcon from '@assets/icons/searchThin.svg';
import BlackCross from '@assets/icons/BlackCross.svg';
import BackIcon from '@assets/navigation/backButton.svg';
import {NAME_LENGTH_LIMIT} from '@configs/constants';

const BasicSearchBar = ({
  searchText,
  setSearchText,
  autofocus = true,
  onFocus,
  bgColor = 'g',
}: {
  onFocus?: () => void;
  autofocus?: boolean;
  bgColor?: 'w' | 'g';
  searchText: string;
  setSearchText: (text: string) => void;
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef(null);
  const onTextChange = (newText: string) => {
    setSearchText(newText);
  };

  const onInputFocus = () => {
    setIsFocused(true);
    if (onFocus) {
      onFocus();
    }
  };

  const onBackPress = () => {
    setSearchText('');
    if (inputRef.current) {
      inputRef.current.blur();
    }
    if (onFocus) {
      onFocus();
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.inputContainer}>
        <View
          style={StyleSheet.compose(styles.inputWrapper, {
            backgroundColor:
              bgColor === 'w'
                ? PortColors.primary.white
                : PortColors.primary.grey.light,
            borderColor: isFocused
              ? PortColors.primary.blue.app
              : PortColors.stroke,
          })}>
          {isFocused ? (
            <TouchableOpacity onPress={onBackPress}>
              <BackIcon width={20} height={20} />
            </TouchableOpacity>
          ) : (
            <SearchIcon width={20} height={20} />
          )}
          <TextInput
            ref={inputRef}
            autoFocus={autofocus}
            onFocus={onInputFocus}
            onBlur={() => setIsFocused(false)}
            style={styles.textInput}
            placeholder={'Search here...'}
            placeholderTextColor={PortColors.primary.grey.medium}
            maxLength={NAME_LENGTH_LIMIT}
            value={searchText}
            onChangeText={onTextChange}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <BlackCross width={15} height={15} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  inputWrapper: {
    marginRight: PortSpacing.secondary.right,
    width: '100%',
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

export default BasicSearchBar;
