import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';

import { useColors } from '@components/colorGuide';
import {isIOS} from '@components/ComponentUtils';
import { FontSizeType, FontWeight, NumberlessText } from '@components/NumberlessText';
import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import OptionWithRadio from '@components/Reusable/OptionButtons/OptionWithRadio';
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
    shouldAutoClose={false}
      bgColor="g"
      onClose={() => setShowThemeBottomsheet(false)}
      showClose={false}
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
      <SimpleCard
        style={{
          paddingVertical: Spacing.l,
          width: '100%',
          marginTop: Spacing.m,
          ...(isIOS ? {marginBottom:  Spacing.l} : 0),
        }}>
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={themeOptions}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          horizontal={false}
          renderItem={item => {
            return (
              <View>
                <OptionWithRadio
                  selectedOptionComparision={selected}
                  selectedOption={item.item.value}
                  title={item.item.key}
                  onClick={() => onThemeSelect(item.item.value)}
                />
                {item.index !== themeOptions.length - 1 && <LineSeparator />}
              </View>
            );
          }}
        />
      </SimpleCard>
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
