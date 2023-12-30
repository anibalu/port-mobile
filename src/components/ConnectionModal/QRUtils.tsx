import {PortColors, screen} from '@components/ComponentUtils';
import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Exclamation from '@assets/icons/exclamation.svg';
import Logo from '@assets/icons/Logo.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
/**
 *
 * @param hasError, boolean that denotes if an error is hit
 * @param qrData, string that needs to be displayed as a QR.
 * @returns {ReactNode}, UI element
 */
export const displayQR = (hasError: boolean, qrData: string): ReactNode => {
  return (
    <View style={styles.qrBox}>
      {hasError ? (
        <View style={styles.errorBox}>
          <Exclamation />
          <NumberlessText
            fontType={FontType.md}
            style={{marginTop: 16}}
            fontSizeType={FontSizeType.s}
            textColor={PortColors.text.secondary}>
            Error generating code
          </NumberlessText>
        </View>
      ) : (
        <View style={styles.qrBox}>
          <QRCode value={qrData} size={screen.width * 0.5} />
          <View style={styles.logoBox}>
            <Logo width={screen.width * 0.08} height={screen.width * 0.08} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  qrBox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    position: 'absolute',
    backgroundColor: '#000000',
    padding: 5,
    borderRadius: 10,
  },
  errorBox: {
    backgroundColor: PortColors.primary.grey.light,
    borderRadius: 16,
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
});
