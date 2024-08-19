/**
 * Card that displays a port
 */

import React from 'react';
import {StyleSheet, View} from 'react-native';
import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import DefaultLoader from '../Loaders/DefaultLoader';
import QRCode from 'react-native-qrcode-svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {jsonToUrl} from '@utils/JsonToUrl';
import {
  DirectSuperportBundle,
  GroupBundle,
  GroupSuperportBundle,
  PortBundle,
} from '@utils/Ports/interfaces';
import {AvatarBox} from '../AvatarBox/AvatarBox';

const QrWithLogo = ({
  isLoading,
  hasFailed,
  qrData,
  profileUri,
}: {
  profileUri?: string | null;
  isLoading: boolean;
  hasFailed: boolean;
  qrData:
    | PortBundle
    | GroupBundle
    | DirectSuperportBundle
    | GroupSuperportBundle
    | null;
}) => {
  return (
    <View style={styles.qrBox}>
      {hasFailed ? (
        <NumberlessText
          style={{color: PortColors.primary.red.error}}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.s}>
          Failed
        </NumberlessText>
      ) : isLoading ? (
        <DefaultLoader />
      ) : qrData ? (
        <>
          <QRCode
            backgroundColor="white"
            color="black"
            value={jsonToUrl(qrData as any)!}
            size={styles.qrBox.width - 10}
          />
          <View style={styles.logoBox}>
            <AvatarBox avatarSize="s" profileUri={profileUri} />
          </View>
        </>
      ) : (
        <View style={styles.logoBox}>
          <AvatarBox avatarSize="s" profileUri={profileUri} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  qrBox: {
    width: screen.width - 5 * PortSpacing.primary.uniform,
    height: screen.width - 5 * PortSpacing.primary.uniform,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: PortSpacing.tertiary.uniform,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  logoBox: {
    position: 'absolute',
    padding: 2,
    backgroundColor: PortColors.primary.white,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QrWithLogo;
