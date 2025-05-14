import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

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
import GenericBackTopBar from '@components/TopBars/GenericBackTopBar';

import { AppStackParamList } from '@navigation/AppStack/AppStackTypes';

type Props = NativeStackScreenProps<AppStackParamList, 'AccountSettings'>;

const AccountSettings = ({ navigation }: Props) => {
  const Colors = useColors();
  const styles = styling(Colors);

  const svgArray = [
    {
      assetName: 'GreyAngleRightIcon',
      light: require('@assets/light/icons/navigation/GreyAngleRight.svg')
        .default,
      dark: require('@assets/dark/icons/navigation/GreyAngleRight.svg').default,
    },
  ];

  const results = useSVG(svgArray);
  const GreyAngleRightIcon = results.GreyAngleRightIcon;

  return (
    <>
      <CustomStatusBar theme={Colors.theme} backgroundColor={Colors.background} />
      <SafeAreaView backgroundColor={Colors.background}>
        <GenericBackTopBar
          onBackPress={() => navigation.goBack()}
          theme={Colors.theme}
          backgroundColor={Colors.background}
        />
        <ScrollView contentContainerStyle={styles.mainContainer}>
          <View style={{ gap: Spacing.m, marginBottom: Spacing.xl }}>
            <NumberlessText
              textColor={Colors.text.title}
              fontWeight={FontWeight.sb}
              fontSizeType={FontSizeType.es}>
              {'Account Settings'}
            </NumberlessText>
            <NumberlessText
              textColor={Colors.text.subtitle}
              fontWeight={FontWeight.rg}
              fontSizeType={FontSizeType.l}>
              Port prides itself on not collecting any personally identifying
              information.
            </NumberlessText>
            <NumberlessText
              textColor={Colors.text.subtitle}
              fontWeight={FontWeight.rg}
              fontSizeType={FontSizeType.l}>
              All sensitive information
              like your nickname and profile picture are stored locally and
              shared with your connections in an end-to-end encrypted manner.
            </NumberlessText>
          </View>
          <Pressable
            onPress={() => navigation.push('DeleteAccount')}
            style={styles.button}>
            <NumberlessText
              fontSizeType={FontSizeType.l}
              fontWeight={FontWeight.rg}
              textColor={Colors.red}>
              Delete my account
            </NumberlessText>
            <GreyAngleRightIcon />
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingHorizontal: Spacing.l,
      paddingBottom: Spacing.l,
    },
    button: {
      backgroundColor: Colors.surface,
      height: 58,
      justifyContent: 'space-between',
      flexDirection: 'row',
      borderRadius: 16,
      paddingHorizontal: Spacing.l,
      alignItems: 'center',
      borderWidth: 0.5,
      borderColor: Colors.stroke
    },
  });

export default AccountSettings;
