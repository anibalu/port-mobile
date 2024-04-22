/**
 * Card that displays a port or a superport
 * Takes the following props:
 * 1. isLoading - whether the bundle to display is still generating
 * 2. hasFailed - whether bundle generation has failed
 * 3. isSuperport - whether card is for a superport
 * 4. profileUri - profile picture to display
 * 5. title - title to display (profile name is passed in currently)
 * 6. qrData - qr data to display
 * 9. onTryAgainClicked - what to do when try again is clicked
 */

import React from 'react';
import {StyleSheet, View} from 'react-native';
import SimpleCard from '../Cards/SimpleCard';
import QrWithLogo from '../QR/QrWithLogo';
import {AVATAR_ARRAY} from '@configs/constants';
import {AvatarBox} from '../AvatarBox/AvatarBox';
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

const ShareablePortCard = ({
  profileUri = AVATAR_ARRAY[0],
  title,
  qrData,
}: {
  profileUri?: string | null;
  title: string;
  qrData: string | null;
}) => {
  return (
    <SimpleCard style={styles.cardWrapper}>
      <View style={styles.avatarArea}>
        <AvatarBox profileUri={profileUri} avatarSize="s+" />
      </View>
      <View style={styles.contentBox}>
        <NumberlessText
          style={{alignSelf: 'center'}}
          fontType={FontType.md}
          fontSizeType={FontSizeType.xl}>
          {title}
        </NumberlessText>
      </View>
      <QrWithLogo qrData={qrData} isLoading={false} hasFailed={false} />

      <View style={styles.contentBox}>
        <NumberlessText
          style={{textAlign: 'center', color: PortColors.subtitle}}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.s}>
          Scan this code using your Port camera to add me as a contact
        </NumberlessText>
      </View>
    </SimpleCard>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 0, //overrides simple card default padding
    paddingTop: 30,
    width: '100%',
  },
  avatarArea: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    width: 60,
    borderRadius: 12,
    backgroundColor: PortColors.primary.white,
    marginTop: -30,
  },
  contentBox: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: PortSpacing.intermediate.uniform,
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

export default ShareablePortCard;
