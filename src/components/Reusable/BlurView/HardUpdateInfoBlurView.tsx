/**
 * HardUpdateInfoBlurView component renders a modal for informing users about
 * updated Terms and Conditions. Users can read and have to accept the updated terms
 * to continue using the app.
 */

import {Linking, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import PrimaryButton from '../LongButtons/PrimaryButton';
import AvatarWithDocument from '@assets/icons/AvatarWithDocument.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {useTheme} from 'src/context/ThemeContext';
import CheckBox from '../MultiSelectMembers/CheckBox';
import {useUpdateStatus} from 'src/context/UpdateStatusContext';
import {sendUpdatedAcceptance} from '@utils/TermsAndConditions/APICalls';
import {saveUpdateStatusToLocal} from '@utils/TermsAndConditions';
import {ToastType, useToast} from 'src/context/ToastContext';

const HardUpdateInfoBlurView = () => {
  const {
    onHardModalClose,
    showHardUpdateInfoModal,
    setUpdateStatusLoading,
    updateStatusLoading,
  } = useUpdateStatus();
  const {themeValue} = useTheme();
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const Colors = DynamicColors();
  const svgArray = [
    {
      assetName: 'PortTextLogo',
      light: require('@assets/light/icons/portTextLogo.svg').default,
      dark: require('@assets/dark/icons/portTextLogo.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const styles = styling(Colors);
  const PortTextLogo = results.PortTextLogo;
  const {showToast} = useToast();

  interface TermsAndConditionsStatus {
    shouldNotify: boolean;
    needsToAccept: boolean;
  }

  const onAcceptClicked = async () => {
    setUpdateStatusLoading(true);
    const value: TermsAndConditionsStatus = {
      needsToAccept: false,
      shouldNotify: false,
    };

    try {
      await sendUpdatedAcceptance();
      await saveUpdateStatusToLocal(value);
      onHardModalClose();
    } catch (error) {
      showToast(
        'An error occurred while accepting! Please check your internet connection and try again',
        ToastType.error,
      );
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  if (!showHardUpdateInfoModal) {
    return null;
  }
  return (
    <TouchableOpacity activeOpacity={1} style={styles.mainContainer}>
      <TouchableOpacity activeOpacity={1} style={styles.boxWrapper}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <PortTextLogo height={20} width={20} style={{flexGrow: 1}} />
          </View>
          <NumberlessText
            fontType={FontType.md}
            fontSizeType={FontSizeType.l}
            textColor={Colors.text.primary}>
            We’ve updated our Terms and Conditions
          </NumberlessText>
        </View>
        <View style={styles.contentContainer}>
          <AvatarWithDocument style={styles.avatar} />
          <View style={styles.textContainer}>
            <NumberlessText
              style={{textAlign: 'left'}}
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
            <View style={styles.acceptContainer}>
              <TouchableOpacity onPress={() => setAcceptedTerms(p => !p)}>
                <CheckBox value={acceptedTerms} />
              </TouchableOpacity>
              <NumberlessText
                fontType={FontType.sb}
                fontSizeType={FontSizeType.l}
                textColor={Colors.text.primary}>
                I have read and agree to the Terms
              </NumberlessText>
            </View>
          </View>
        </View>
        <View>
          <PrimaryButton
            textStyle={{
              textAlign: 'center',
              flex: 1,
            }}
            buttonText="Accept"
            disabled={!acceptedTerms}
            isLoading={updateStatusLoading}
            onClick={async () => await onAcceptClicked()}
            primaryButtonColor={themeValue !== 'dark' ? 'w' : 'black'}
          />
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
      backgroundColor: colors.primary.surface2,
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
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      width: '100%',
    },
    acceptContainer: {
      marginVertical: PortSpacing.secondary.uniform,
      alignItems: 'center',
      flexDirection: 'row',
      gap: PortSpacing.tertiary.right,
      justifyContent: 'center',
    },
  });

export default HardUpdateInfoBlurView;
