import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';

import QRCode from 'react-native-qrcode-svg';

import {useThemeColors} from '@components/colorGuide';
import DefaultLoader from '@components/Loaders/DefaultLoader';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import {Spacing, Width} from '@components/spacingGuide';

import {jsonToUrl} from '@utils/JsonToUrl';

import RetryIcon from '@assets/icons/RedRetry.svg';

/**
 * A component that displays a QR code and a retry button.
 * @param hasFailed - Whether the QR code has failed to generate.
 * @param errorMessage - The error message to display.
 * @param qrData - The data to display in the QR code.
 * @param theme - The theme to use.
 * @param onTryAgainClicked - The function to call when the retry button is pressed.
 */
const SimpleQR = ({
  hasFailed,
  errorMessage,
  qrData,
  theme,
  onTryAgainClicked,
}: {
  hasFailed: boolean;
  errorMessage?: string | null;
  qrData: any;
  theme: 'light' | 'dark';
  onTryAgainClicked: () => void;
}) => {
  const Colors = useThemeColors(theme);
  const styles = styling(Colors);

  return (
    <View style={styles.qrBox}>
      {hasFailed ? (
        <>
          <NumberlessText
            style={{color: Colors.red}}
            fontWeight={FontWeight.rg}
            fontSizeType={FontSizeType.m}>
            {errorMessage ? errorMessage : 'Failed to generate a Port.'}
          </NumberlessText>
          <TouchableOpacity
            onPress={onTryAgainClicked}
            style={styles.retryButton}
            activeOpacity={0.6}>
            <RetryIcon />
            <NumberlessText
              style={{color: Colors.red}}
              fontWeight={FontWeight.rg}
              fontSizeType={FontSizeType.m}>
              Retry
            </NumberlessText>
          </TouchableOpacity>
        </>
      ) : qrData ? (
        <QRCode
        backgroundColor={Colors.white}
        color={Colors.mildBlack}
          value={jsonToUrl(qrData as any) || 'https://porting.me'}
          size={styles.qrBox.width - 10}
        />
      ) : (
        <DefaultLoader color={Colors.accent} />
      )}
    </View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    qrBox: {
      width: Width.screen - 10 * Spacing.l,
      height: Width.screen - 10 * Spacing.l,
      justifyContent: 'center',
      alignItems: 'center',
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.s,
      marginTop: Spacing.l,
      borderWidth: 1,
      borderColor: colors.red,
      paddingHorizontal: Spacing.l,
      paddingVertical: Spacing.l,
      borderRadius: 16,
    },
  });

export default SimpleQR;
