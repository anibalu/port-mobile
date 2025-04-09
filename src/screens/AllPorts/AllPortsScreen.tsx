import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';
import GenericTitle from '@components/Text/GenericTitle';

import useDynamicSVG from '@utils/Themes/createDynamicSVG';

const AllPortsScreen = () => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const svgArray = [
    {
      assetName: 'Filter',
      light: require('@assets/dark/icons/FilterIcon.svg').default,
      dark: require('@assets/dark/icons/FilterIcon.svg').default,
    },
    {
      assetName: 'Download',
      light: require('@assets/light/icons/DownloadArrow.svg').default,
      dark: require('@assets/dark/icons/DownloadArrow.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const [selectedTab, _setSelectedTab] = useState<string>('All ports');

  const Filter = results.Filter;

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView>
        <GenericTitle title="Ports" />
        <View style={styles.row}>
          <NumberlessText
            style={{marginRight: PortSpacing.tertiary.uniform}}
            fontSizeType={FontSizeType.m}
            fontType={FontType.md}
            textColor={Colors.text.subtitle}>
            Filter by
          </NumberlessText>
          <Filter />
          <View
            style={
              selectedTab === 'All ports' ? styles.selectedTab : styles.tab
            }>
            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}
              textColor={
                selectedTab === 'All ports'
                  ? Colors.primary.white
                  : Colors.text.subtitle
              }>
              All ports
            </NumberlessText>
          </View>
          <View
            style={
              selectedTab === 'Reusable' ? styles.selectedTab : styles.tab
            }>
            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}
              textColor={
                selectedTab === 'Reusable'
                  ? Colors.primary.white
                  : Colors.text.subtitle
              }>
              Reusable
            </NumberlessText>
          </View>
        </View>

        {/* Ports cards will come here in a flatlist
       need the db call to get the ports + superports data */}
      </SafeAreaView>
    </>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      paddingLeft: PortSpacing.secondary.uniform,
      paddingBottom: PortSpacing.secondary.uniform,
      backgroundColor: Colors.primary.surface,
      alignItems: 'center',
    },
    tab: {
      borderRadius: 24,
      borderWidth: 0.5,
      borderColor: Colors.primary.stroke,
      paddingVertical: PortSpacing.tertiary.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
      marginHorizontal: 4,
    },
    selectedTab: {
      borderRadius: 24,
      paddingVertical: PortSpacing.tertiary.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
      marginHorizontal: 4,
      backgroundColor: Colors.primary.accent,
    },
  });

export default AllPortsScreen;
