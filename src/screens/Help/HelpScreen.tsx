import {PortSpacing, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {SafeAreaView} from '@components/SafeAreaView';
import React from 'react';
import {Linking, Pressable, StyleSheet, View} from 'react-native';
import BackTopbar from '@components/Reusable/TopBars/BackTopBar';
import {useNavigation} from '@react-navigation/native';

import DynamicColors from '@components/DynamicColors';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

// TODO: Why is the legal screen labeled HelpScreen
const HelpScreen = () => {
  const navigation = useNavigation();

  const Colors = DynamicColors();
  const styles = styling(Colors);

  const svgArray = [
    {
      assetName: 'AngleRight',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const BlackAngleRight = results.AngleRight;

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={styles.screen}>
        <BackTopbar
          onBackPress={() => navigation.goBack()}
          title="Legal"
          bgColor="w"
        />
        <View style={styles.mainComponent}>
          <SimpleCard style={styles.card}>
            <Pressable
              style={styles.button}
              onPress={() =>
                Linking.openURL(
                  'https://port.numberless.tech/TermsAndConditions',
                )
              }>
              <View style={{flexDirection: 'row'}}>
                <NumberlessText
                  style={{marginLeft: PortSpacing.tertiary.left}}
                  textColor={Colors.text.primary}
                  fontType={FontType.sb}
                  fontSizeType={FontSizeType.l}>
                  Terms
                </NumberlessText>
              </View>
              <View
                style={{flexDirection: 'row', gap: 3, alignItems: 'center'}}>
                <BlackAngleRight />
              </View>
            </Pressable>
          </SimpleCard>
          <SimpleCard style={styles.card}>
            <Pressable
              style={styles.button}
              onPress={() =>
                Linking.openURL('https://port.numberless.tech/PrivacyPolicy')
              }>
              <View style={{flexDirection: 'row'}}>
                <NumberlessText
                  style={{
                    marginLeft: PortSpacing.tertiary.left,
                  }}
                  textColor={Colors.text.primary}
                  fontType={FontType.sb}
                  fontSizeType={FontSizeType.l}>
                  Privacy Policy
                </NumberlessText>
              </View>
              <View
                style={{flexDirection: 'row', gap: 3, alignItems: 'center'}}>
                <BlackAngleRight />
              </View>
            </Pressable>
          </SimpleCard>
        </View>
      </SafeAreaView>
    </>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    screen: {
      alignItems: 'center',
      backgroundColor: colors.primary.background,
    },
    mainComponent: {
      flex: 1,
      width: screen.width,
      backgroundColor: colors.primary.background,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingBottom: PortSpacing.secondary.bottom,
      paddingHorizontal: PortSpacing.secondary.uniform,
      marginTop: PortSpacing.secondary.top,
    },
    card: {
      width: '100%',
      paddingHorizontal: PortSpacing.secondary.uniform,
      marginTop: PortSpacing.secondary.top,
      paddingVertical: 0,
    },
    button: {
      paddingVertical: PortSpacing.secondary.uniform,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  });
export default HelpScreen;
