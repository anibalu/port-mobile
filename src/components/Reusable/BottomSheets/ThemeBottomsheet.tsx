import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';

import { useColors } from '@components/colorGuide';
import { FontSizeType, FontWeight, NumberlessText } from '@components/NumberlessText';
import OptionWithRadio from '@components/Options/OptionWithRadio';
import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import LineSeparator from '@components/Separators/LineSeparator';
import { Spacing, Width } from '@components/spacingGuide';

import {ThemeType, themeOptions} from '@utils/Themes';


import {useTheme} from 'src/context/ThemeContext';

const ThemeBottomsheet = ({
  setShowThemeBottomsheet,
  showThemeBottomsheet,
  selected,
  setSelected,
}: {
  setShowThemeBottomsheet: (show: boolean) => void;
  showThemeBottomsheet: boolean;
  selected: ThemeType;
  setSelected: (value: ThemeType) => void;
}) => {
  const {handleThemeChange} = useTheme();

  const onThemeSelect = async (themeValue: any) => {
    setSelected(themeValue);
    handleThemeChange(themeValue);
    setShowThemeBottomsheet(false);
  };
const Colors = useColors()
  return (
    <PrimaryBottomSheet
      onClose={() => setShowThemeBottomsheet(false)}
      showClose={false}
      showNotch={false}
      visible={showThemeBottomsheet}
    >
       <View style={styles.connectionOptionsRegion}>
        <View style={styles.mainContainer}>
          <NumberlessText
            textColor={Colors.text.title}
            fontSizeType={FontSizeType.xl}
            fontWeight={FontWeight.sb}>
            Theme
          </NumberlessText>
          <LineSeparator style={{width: Width.screen}} />
        </View>
      </View>
      <View
        style={{
          width: Width.screen,
        }}>
        <FlatList
          keyExtractor={(_item, index) => index.toString()}
          data={themeOptions}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          horizontal={false}
          renderItem={item => {
            return (
              <View>
                <OptionWithRadio
                  separator={item.index !== themeOptions.length - 1}
                  selectedOptionComparision={selected}
                  selectedOption={item.item.value}
                  title={item.item.key}
                  onClick={() => onThemeSelect(item.item.value)}
                />
              </View>
            );
          }}
        />
      </View>
    </PrimaryBottomSheet>
  );
};

const styles =StyleSheet.create({
  connectionOptionsRegion: {
    width: Width.screen,
    paddingHorizontal: Spacing.l,
  },
  mainContainer: {
    width: '100%',
    paddingTop: Spacing.s,
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.m,
  },
})

export default ThemeBottomsheet;
