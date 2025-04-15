import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import { useColors } from '@components/colorGuide';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import BackTopbar from '@components/Reusable/TopBars/BackTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import { Spacing } from '@components/spacingGuide';
import useSVG from '@components/svgGuide';

import {AppStackParamList} from '@navigation/AppStack/AppStackTypes';

type Props = NativeStackScreenProps<AppStackParamList, 'AccountSettings'>;

const AccountSettings = ({navigation}: Props) => {
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
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={Colors.surface}
      />

      <SafeAreaView style={styles.screen}>
        <BackTopbar
          bgColor="w"
          onBackPress={() => navigation.goBack()}
          title="Account Settings"
        />
        <View style={styles.content}>
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
          <NumberlessText
            style={{marginLeft: Spacing.l}}
            fontSizeType={FontSizeType.m}
            fontWeight={FontWeight.rg}
            textColor={Colors.text.title}>
            Port prides itself on not collecting any personally identifying
            information. It's the reason we exist. All sensitive information
            like your nickname and profile pictuire are stored locally and
            shared with your connections in with end-to-end encryption.
          </NumberlessText>
        </View>
      </SafeAreaView>
    </>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: Colors.black,
    },
    content: {
      flex: 1,
      flexDirection: 'column',
      alignContent: 'flex-start',
      padding: Spacing.m,
      gap: Spacing.s,
      backgroundColor: Colors.background,
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
