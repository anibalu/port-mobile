/**
 * Card that displays a port
 */

import React from 'react';
import {StyleSheet, View} from 'react-native';
import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import DefaultLoader from '../Loaders/DefaultLoader';
import QRCode from 'react-native-qrcode-svg';
import Logo from '@assets/branding/LogoBlue.svg';
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
import DynamicColors from '@components/DynamicColors';

const QrWithLogo = ({
  isLoading,
  hasFailed,
  qrData,
}: {
  isLoading: boolean;
  hasFailed: boolean;
  qrData:
    | PortBundle
    | GroupBundle
    | DirectSuperportBundle
    | GroupSuperportBundle
    | null;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);

  if (hasFailed) {
    return (
      <View style={styles.qrBox}>
        <NumberlessText
          style={{color: PortColors.primary.red.error}}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.s}>
          Failed
        </NumberlessText>
      </View>
    );
  } else if (isLoading) {
    return (
      <View style={styles.qrBox}>
        <DefaultLoader />
      </View>
    );
  }
  return (
    <View style={styles.qrBox}>
      {qrData && (
        <QRCode
          backgroundColor="white"
          color="black"
          value={jsonToUrl(qrData as any)!}
          size={styles.qrBox.width - 10}
        />
      )}
      <View style={styles.logoBox}>
        <Logo width={28} height={28} />
      </View>
    </View>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
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
      width: 50,
      height: 50,
      backgroundColor: PortColors.primary.white,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: color.primary.stroke,
    },
  });

export default QrWithLogo;
