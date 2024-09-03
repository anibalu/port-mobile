import {PortSpacing, isIOS} from '@components/ComponentUtils';

import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import OptionWithRadio from '@components/Reusable/OptionButtons/OptionWithRadio';
import LineSeparator from '@components/Reusable/Separators/LineSeparator';
import {themeOptions} from '@utils/Themes';
import {ThemeType} from '@utils/Themes';
import React from 'react';
import {FlatList, View} from 'react-native';
import {useTheme} from 'src/context/ThemeContext';
export interface ThemeOptionTypes {
  key: string;
  value: ThemeType;
}

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

  return (
    <PrimaryBottomSheet
      bgColor="g"
      onClose={() => setShowThemeBottomsheet(false)}
      showClose={true}
      visible={showThemeBottomsheet}
      title="Theme">
      <SimpleCard
        style={{
          paddingVertical: PortSpacing.secondary.uniform,
          width: '100%',
          marginTop: PortSpacing.medium.top,
          ...(isIOS ? {marginBottom: PortSpacing.secondary.bottom} : 0),
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

export default ThemeBottomsheet;
