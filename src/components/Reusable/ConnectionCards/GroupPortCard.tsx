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
import OneTimePill from '@assets/icons/NewGroupPill.svg';

const GroupPortCard = ({
  isLoading,
  isLinkLoading,
  hasFailed,
  profileUri = AVATAR_ARRAY[0],
  title,
  qrData,
  onShareLinkClicked,
  onTryAgainClicked,
  desc,
}: {
  isLoading: boolean;
  isLinkLoading: boolean;
  hasFailed: boolean;
  profileUri?: string;
  title: string;
  qrData:
    | PortBundle
    | GroupBundle
    | DirectSuperportBundle
    | GroupSuperportBundle
    | null;
  onShareLinkClicked: () => Promise<void>;
  onTryAgainClicked: () => Promise<void>;
  desc?: string;
}) => {
  const Colors = DynamicColors();

  const svgArray = [
    {
      assetName: 'ShareAccent',
      light: require('@assets/icons/ShareAccent.svg').default,
      dark: require('@assets/dark/icons/ShareAccent.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const Share = results.ShareAccent;
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
          }}>
          <OneTimePill />
        </View>
      </View>
      <QrWithLogo
        qrData={qrData}
        profileUri={profileUri}
        isLoading={isLoading}
        hasFailed={hasFailed}
      />
      <NumberlessText
        style={{alignSelf: 'center', paddingTop: PortSpacing.secondary.top}}
        fontType={FontType.md}
        textColor={Colors.text.primary}
        fontSizeType={FontSizeType.xl}>
        {title}
      </NumberlessText>
      {desc && (
        <NumberlessText
          style={{textAlign: 'center', paddingTop: PortSpacing.tertiary.top}}
          fontType={FontType.rg}
          textColor={Colors.text.subtitle}
          fontSizeType={FontSizeType.m}>
          {desc}
        </NumberlessText>
      )}
      {!hasFailed && (
        <View style={styles.contentBox}>
          <NumberlessText
            style={{textAlign: 'center'}}
            fontType={FontType.rg}
            textColor={Colors.text.subtitle}
            fontSizeType={FontSizeType.s}>
            Show this group Port or share it as a one-time use link to add a new
            member.
          </NumberlessText>
        </View>
      )}

      {hasFailed && (
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
            You've reached your offline group Port limit of 10. Connect to the
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

      {!hasFailed && !isLoading && (
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

export default GroupPortCard;
