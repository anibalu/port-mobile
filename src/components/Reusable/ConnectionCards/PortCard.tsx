/**
 * Card that displays a port or a superport
 * Takes the following props:
 * 1. isLoading - whether the bundle to display is still generating
 * 2. hasFailed - whether bundle generation has failed
 * 3. isSuperport - whether card is for a superport
 * 4. profileUri - profile picture to display
 * 5. title - title to display (profile name is passed in currently)
 * 6. qrData - qr data to display
 * 7. onShareLinkClicked - what to do when share is clicked
 * 8. onPreviewImageClicked - what to do when preview is clicked for superport cards
 * 9. onTryAgainClicked - what to do when try again is clicked
 */

import React from 'react';
import {StyleSheet, View} from 'react-native';
import SimpleCard from '../Cards/SimpleCard';
import QrWithLogo from '../QR/QrWithLogo';
import {AVATAR_ARRAY} from '@configs/constants';
import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SecondaryButton from '../LongButtons/SecondaryButton';
import RetryIcon from '@assets/icons/Retry.svg';
import AlternateSecondaryButton from '../LongButtons/AlternateSecondaryButton';
import DynamicColors from '@components/DynamicColors';
import {
  DirectSuperportBundle,
  GroupBundle,
  GroupSuperportBundle,
  PortBundle,
} from '@utils/Ports/interfaces';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {useTheme} from 'src/context/ThemeContext';

const PortCard = ({
  isLoading,
  isLinkLoading,
  hasFailed,
  isSuperport,
  profileUri = AVATAR_ARRAY[0],
  title,
  qrData,
  onShareLinkClicked,
  onPreviewImageClicked = async () => {},
  onTryAgainClicked,
  isPreviewLoading,
}: {
  isPreviewLoading?: boolean;
  isLoading: boolean;
  isLinkLoading: boolean;
  hasFailed: boolean;
  isSuperport: boolean;
  profileUri?: string;
  title: string;
  qrData:
    | PortBundle
    | GroupBundle
    | DirectSuperportBundle
    | GroupSuperportBundle
    | null;
  onShareLinkClicked: () => Promise<void>;
  onPreviewImageClicked?: () => Promise<void>;
  onTryAgainClicked: () => Promise<void>;
}) => {
  const Colors = DynamicColors();

  const svgArray = [
    {
      assetName: 'ShareAccent',
      light: require('@assets/icons/ShareAccent.svg').default,
      dark: require('@assets/dark/icons/ShareAccent.svg').default,
    },
    {
      assetName: 'Eye',
      light: require('@assets/icons/BlueEye.svg').default,
      dark: require('@assets/dark/icons/BlueEye.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const Share = results.ShareAccent;
  const Eye = results.Eye;
  const {themeValue} = useTheme();
  const styles = styling(Colors);

  return (
    <SimpleCard style={styles.cardWrapper}>
      <View style={styles.contentBox}>
        <View
          style={{
            paddingVertical: 4,
            paddingHorizontal: 6,
            borderRadius: PortSpacing.intermediate.uniform,
            marginBottom: PortSpacing.medium.uniform,
            backgroundColor:
              themeValue === 'dark'
                ? Colors.primary.accent
                : Colors.lowAccentColors.violet,
          }}>
          <NumberlessText
            textColor={
              themeValue === 'dark'
                ? Colors.primary.white
                : Colors.primary.accent
            }
            style={{
              textAlign: 'center',
            }}
            fontType={FontType.sb}
            fontSizeType={FontSizeType.s}>
            {isSuperport ? '  Multi-use QR' : 'One-time use QR'}
          </NumberlessText>
        </View>
        <NumberlessText
          style={{alignSelf: 'center'}}
          fontType={FontType.md}
          textColor={Colors.text.primary}
          fontSizeType={FontSizeType.xl}>
          {title}
        </NumberlessText>
      </View>
      <QrWithLogo
        qrData={qrData}
        profileUri={profileUri}
        isLoading={isLoading}
        hasFailed={hasFailed}
      />
      {!hasFailed && (
        <View style={styles.contentBox}>
          {isSuperport ? (
            <NumberlessText
              style={{
                textAlign: 'center',
              }}
              fontType={FontType.rg}
              textColor={Colors.text.subtitle}
              fontSizeType={FontSizeType.s}>
              Show this Superport or share it as a multi-use link to form a new
              chat.
            </NumberlessText>
          ) : (
            <NumberlessText
              style={{textAlign: 'center'}}
              fontType={FontType.rg}
              textColor={Colors.text.subtitle}
              fontSizeType={FontSizeType.s}>
              Show this Port or share it as a one-time use link to form a new
              chat.
            </NumberlessText>
          )}
        </View>
      )}
      {hasFailed && isSuperport && (
        <View style={styles.errorBox}>
          <NumberlessText
            style={{
              textAlign: 'center',
              color: Colors.primary.red,
              marginBottom: PortSpacing.intermediate.bottom,
              paddingHorizontal: PortSpacing.tertiary.uniform,
            }}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.s}>
            Sorry, but we couldn't create a Superport at the moment. Check your
            network connection and try again.
          </NumberlessText>
          <SecondaryButton
            buttonText={'Try Again'}
            secondaryButtonColor={'black'}
            Icon={RetryIcon}
            iconSize={'s'}
            onClick={onTryAgainClicked}
          />
        </View>
      )}
      {hasFailed && !isSuperport && (
        <View style={styles.errorBox}>
          <NumberlessText
            style={{
              textAlign: 'center',
              color: Colors.primary.red,
              marginBottom: PortSpacing.intermediate.bottom,
              paddingHorizontal: PortSpacing.tertiary.uniform,
            }}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.s}>
            You've reached your offline Port limit of 10. Connect to the
            internet to continue connecting.
          </NumberlessText>
          <SecondaryButton
            buttonText={'Try Again'}
            secondaryButtonColor={'black'}
            Icon={RetryIcon}
            iconSize={'s'}
            onClick={onTryAgainClicked}
          />
        </View>
      )}
      {!hasFailed && isSuperport && (
        <View style={styles.shareBox}>
          <AlternateSecondaryButton
            buttonText={'Share multi-use link'}
            onClick={onShareLinkClicked}
            Icon={Share}
            isLoading={isLinkLoading}
          />
          <AlternateSecondaryButton
            buttonText={'Preview shareable image'}
            onClick={onPreviewImageClicked}
            Icon={Eye}
            isLoading={
              isPreviewLoading === undefined ? isLinkLoading : isPreviewLoading
            }
          />
        </View>
      )}
      {!hasFailed && !isLoading && !isSuperport && (
        <View style={styles.shareBox}>
          <AlternateSecondaryButton
            buttonText={'Create one-time use link'}
            onClick={onShareLinkClicked}
            Icon={Share}
            isLoading={isLinkLoading}
          />
        </View>
      )}
    </SimpleCard>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    cardWrapper: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingVertical: 0, //overrides simple card default padding
      width: '100%',
      borderWidth: 0.5,
      borderColor: color.primary.stroke,
    },
    contentBox: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      padding: PortSpacing.secondary.uniform,
    },
    errorBox: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      padding: PortSpacing.secondary.uniform,
    },
    shareBox: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingBottom: PortSpacing.secondary.bottom,
      gap: PortSpacing.tertiary.uniform,
    },
  });

export default PortCard;
