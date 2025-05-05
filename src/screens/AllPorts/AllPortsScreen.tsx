import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import PortsCard from '@components/Cards/PortsCard';
import { useColors } from '@components/colorGuide';
import { CustomStatusBar } from '@components/CustomStatusBar';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import { SafeAreaView } from '@components/SafeAreaView';
import { Spacing } from '@components/spacingGuide';
import useSVG from '@components/svgGuide';
import GenericTitle from '@components/Text/GenericTitle';

import { GeneratedPortData, GeneratedPortsAndSuperports, GeneratedSuperportData , getGeneratedPortsAndSuperports } from '@utils/Ports';


enum PortsScreenTabs {
  AllPorts = 'All ports',
  Reusable = 'Reusable',
}

const AllPortsScreen = () => {
  const Colors = useColors();
  const styles = styling(Colors);
  const svgArray = [
    {
      assetName: 'Filter',
      light: require('@assets/dark/icons/FilterIcon.svg').default,
      dark: require('@assets/dark/icons/FilterIcon.svg').default,
    },
  ];
  const results = useSVG(svgArray);
  const [selectedTab, setSelectedTab] = useState<PortsScreenTabs>(PortsScreenTabs.AllPorts);

  const Filter = results.Filter;

  const [generatedPortsAndSuperports, setGeneratedPortsAndSuperports] = useState<GeneratedPortsAndSuperports[]>([]);
  const [generatedSuperports, setGeneratedSuperports] = useState<GeneratedPortsAndSuperports[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const data = await getGeneratedPortsAndSuperports();
          setGeneratedPortsAndSuperports(data);
        } catch (error) {
          console.error('Error fetching generated ports and superports:', error);
        }
      };
      fetchData();
    }, []),
  );

  useEffect(() => {
    // Filter only superports from the combined array
    const superportsOnly = generatedPortsAndSuperports.filter(
      port => port.isSuperport === true
    );
    setGeneratedSuperports(superportsOnly);
  }, [generatedPortsAndSuperports]);

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.background2} theme={Colors.theme} />
      <SafeAreaView backgroundColor={Colors.background} >
        <GenericTitle title="Ports" />
        <View style={styles.row}>
          <NumberlessText
            style={{ marginRight: Spacing.m }}
            fontSizeType={FontSizeType.l}
            fontWeight={FontWeight.rg}
            textColor={Colors.text.subtitle}>
            Filter by
          </NumberlessText>
          <View style={{ marginRight: Spacing.s }}>
            <Filter />
          </View>
          <TouchableOpacity
            onPress={() => setSelectedTab(PortsScreenTabs.AllPorts)}
            activeOpacity={0.6}
            style={
              selectedTab === PortsScreenTabs.AllPorts ? styles.selectedTab : styles.tab
            }>
            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontWeight={FontWeight.rg}
              textColor={
                selectedTab === PortsScreenTabs.AllPorts
                  ? Colors.white
                  : Colors.text.subtitle
              }>
              All ports
            </NumberlessText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTab(PortsScreenTabs.Reusable)}
            activeOpacity={0.6}
            style={
              selectedTab === PortsScreenTabs.Reusable ? styles.selectedTab : styles.tab
            }>
            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontWeight={FontWeight.rg}
              textColor={
                selectedTab === PortsScreenTabs.Reusable
                  ? Colors.white
                  : Colors.text.subtitle
              }>
              Reusable
            </NumberlessText>
          </TouchableOpacity>
        </View>
        <FlatList
          data={selectedTab === PortsScreenTabs.AllPorts ? generatedPortsAndSuperports : generatedSuperports}
          keyExtractor={(item) => item.portId}
          contentContainerStyle={{ paddingHorizontal: Spacing.l, paddingBottom: Spacing.xl, gap: Spacing.s }}
          renderItem={({ item }) => (<>
            <PortsCard
              portId={item.portId}
              title={item.label || ''}
              reusable={item.isSuperport}
              connectionsLeft={item.isSuperport ? (item as GeneratedSuperportData).connectionsLimit - (item as GeneratedSuperportData).connectionsMade : null}
              expiry={item.isSuperport ? null: (item as GeneratedPortData).expiryTimestamp} />
          </>)}
          ListEmptyComponent={() => (
            <View style={{ alignItems: 'center', marginTop: Spacing.xxl }}>
              <NumberlessText
                fontSizeType={FontSizeType.l}
                fontWeight={FontWeight.rg}
                textColor={Colors.text.subtitle}
              >
                No ports found
              </NumberlessText>
            </View>
          )}
        />
      </SafeAreaView>
    </>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      paddingLeft: Spacing.l,
      paddingBottom: Spacing.l,
      backgroundColor: Colors.background2,
      alignItems: 'center',
      marginBottom: Spacing.l
    },
    tab: {
      borderRadius: 24,
      borderWidth: 1,
      borderColor: Colors.stroke,
      paddingVertical: Spacing.m,
      paddingHorizontal: Spacing.l,
      marginLeft: Spacing.s,
    },
    selectedTab: {
      borderRadius: 24,
      paddingVertical: Spacing.m,
      paddingHorizontal: Spacing.l,
      backgroundColor: Colors.purple,
      marginLeft: Spacing.s,
    },
  });

export default AllPortsScreen;
