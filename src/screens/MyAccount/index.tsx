import {PortColors, PortSpacing} from '@components/ComponentUtils';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from '@components/SafeAreaView';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import BackTopbar from '@components/Reusable/TopBars/BackTopBar';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

type Props = NativeStackScreenProps<AppStackParamList, 'AccountSettings'>;

const AccountSettings = ({navigation}: Props) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);

  const svgArray = [
    {
      assetName: 'GreyAngleRightIcon',
      light: require('@assets/light/icons/navigation/GreyAngleRight.svg')
        .default,
      dark: require('@assets/dark/icons/navigation/GreyAngleRight.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const GreyAngleRightIcon = results.GreyAngleRightIcon;

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={Colors.primary.surface}
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
              fontType={FontType.rg}
              textColor={Colors.primary.red}>
              Delete my account
            </NumberlessText>
            <GreyAngleRightIcon />
          </Pressable>
          <NumberlessText
            style={{alignSelf: 'center'}}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}
            textColor={Colors.text.primary}>
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
      backgroundColor: PortColors.primary.black,
    },
    content: {
      flex: 1,
      flexDirection: 'column',
      alignContent: 'flex-start',
      padding: PortSpacing.medium.uniform,
      gap: PortSpacing.tertiary.uniform,
      backgroundColor: Colors.primary.background,
    },
    button: {
      backgroundColor: Colors.primary.surface,
      height: 58,
      justifyContent: 'space-between',
      flexDirection: 'row',
      borderRadius: 16,
      paddingHorizontal: PortSpacing.secondary.uniform,
      alignItems: 'center',
    },
  });

export default AccountSettings;
