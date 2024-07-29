/**
 * SoftUpdateInfoBlurView component renders a modal reminding users of the
 * Terms and Conditions. Users can read and choose to accept the terms to continue using
 * the app.
 */

import {Linking, StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import AvatarWithDocument from '@assets/icons/AvatarWithDocument.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {useUpdateStatus} from 'src/context/UpdateStatusContext';
import {saveUpdateStatusToLocal} from '@utils/TermsAndConditions';

const SoftUpdateInfoBlurView = () => {
  const {onSoftModalClose, showSoftUpdateInfoModal, termsAndConditionsStatus} =
    useUpdateStatus();
  const Colors = DynamicColors();
  const svgArray = [
    {
      assetName: 'CrossIcon',
      light: require('@assets/light/icons/Cross.svg').default,
      dark: require('@assets/dark/icons/Cross.svg').default,
    },
    {
      assetName: 'PortTextLogo',
      light: require('@assets/light/icons/portTextLogo.svg').default,
      dark: require('@assets/dark/icons/portTextLogo.svg').default,
    },
  ];
  interface TermsAndConditionsStatus {
    shouldNotify: boolean;
    needsToAccept: boolean;
  }

  const closeSoftModal = async () => {
    const value: TermsAndConditionsStatus = {
      needsToAccept: termsAndConditionsStatus.needsToAccept,
      shouldNotify: false,
    };

    await saveUpdateStatusToLocal(value);
    onSoftModalClose();
  };

  const results = useDynamicSVG(svgArray);
  const styles = styling(Colors);
  const CrossIcon = results.CrossIcon;
  const PortTextLogo = results.PortTextLogo;

  if (!showSoftUpdateInfoModal) {
    return null;
  }

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={closeSoftModal}
      style={styles.mainContainer}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.boxWrapper}
        onPress={() => {}}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <PortTextLogo height={20} width={20} style={{flexGrow: 1}} />
            <CrossIcon height={24} width={24} onPress={closeSoftModal} />
          </View>
          <NumberlessText
            fontType={FontType.md}
            fontSizeType={FontSizeType.l}
            textColor={Colors.text.primary}>
            Reminder of our terms and conditions
          </NumberlessText>
        </View>
        <View style={styles.contentContainer}>
          <AvatarWithDocument style={styles.avatar} />
          <View style={styles.textContainer}>
            <NumberlessText
              style={{textAlign: 'center'}}
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}
              textColor={Colors.text.subtitle}>
              Our{' '}
              <NumberlessText
                style={{textDecorationLine: 'underline'}}
                onPress={() =>
                  Linking.openURL(
                    'https://port.numberless.tech/TermsAndConditions',
                  )
                }
                fontType={FontType.rg}
                fontSizeType={FontSizeType.m}
                textColor={Colors.primary.accent}>
                Terms and Conditions
              </NumberlessText>{' '}
              and{' '}
              <NumberlessText
                style={{textDecorationLine: 'underline'}}
                fontType={FontType.rg}
                onPress={() =>
                  Linking.openURL('https://port.numberless.tech/PrivacyPolicy')
                }
                fontSizeType={FontSizeType.m}
                textColor={Colors.primary.accent}>
                Privacy Policy
              </NumberlessText>{' '}
              have been recently updated. To continue using our app, please
              review and agree to our updated terms.
            </NumberlessText>
          </View>
        </View>
      </TouchableOpacity>
      {!isIOS && <CustomStatusBar backgroundColor="#00000000" />}
    </TouchableOpacity>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    mainContainer: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#000000BF',
      paddingHorizontal: PortSpacing.secondary.uniform,
      alignItems: 'center',
      justifyContent: 'center',
      height: screen.height,
      width: screen.width,
    },
    boxWrapper: {
      backgroundColor: colors.primary.surface,
      paddingVertical: PortSpacing.intermediate.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
      borderRadius: PortSpacing.intermediate.uniform,
    },
    headerContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: PortSpacing.secondary.bottom,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    avatar: {
      marginVertical: PortSpacing.secondary.uniform,
    },
    textContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default SoftUpdateInfoBlurView;
