import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import useSVG from '@components/svgGuide';
import {Height, Spacing, Width} from '@components/spacingGuide';
import GradientCard from '@components/Cards/GradientCard';
import {useThemeColors} from '@components/colorGuide';
import SimpleQR from '@components/QR/SimpleQR';

const DisplayableSuperPortQRCard = ({
  isLoading,
  hasFailed,
  errorMessage,
  name,
  superPortName,
  labelText,
  qrData,
  link,
  onCopyClicked,
  onTryAgainClicked,
  theme,
}: {
  isLoading: boolean;
  hasFailed: boolean;
  errorMessage?: string | null;
  name?: string | null;
  superPortName?: string | null;
  labelText?: string;
  qrData: any;
  link?: string | null;
  onCopyClicked: () => void;
  onTryAgainClicked: () => void;
  theme: 'light' | 'dark';
}) => {
  const colors = useThemeColors(theme);
  const styles = styling(colors);
  const svgArray = [
    {
      assetName: 'Copy',
      light: require('@assets/icons/AccentCopy.svg').default,
      dark: require('@assets/dark/icons/Copy.svg').default,
    },
  ];
  const results = useSVG(svgArray, colors.theme);
  const Copy = results.Copy;

  return (
    <GradientCard style={styles.cardWrapper}>
      <View
        style={{
          ...styles.labelTextContainer,
          backgroundColor: colors.lowAccentColors.blue,
        }}>
        <NumberlessText
          textColor={colors.boldAccentColors.blue}
          fontWeight={FontWeight.sb}
          fontSizeType={FontSizeType.s}>
          {'Reusable | ' + labelText}
        </NumberlessText>
      </View>
      <SimpleQR
        qrData={qrData}
        theme={colors.theme}
        hasFailed={hasFailed}
        errorMessage={errorMessage}
        onTryAgainClicked={onTryAgainClicked}
      />
      {name && (
        <NumberlessText
          style={{
            marginVertical: Spacing.l,
            paddingHorizontal: Spacing.l,
            overflow: 'visible',
          }}
          fontWeight={FontWeight.sb}
          textColor={colors.text.title}
          fontSizeType={FontSizeType.es}
          numberOfLines={1}
          ellipsizeMode={'tail'}>
          {name}
        </NumberlessText>
      )}
      {superPortName && (
        <NumberlessText
          style={{
            marginBottom: Spacing.l,
            paddingHorizontal: Spacing.l,
            overflow: 'visible',
          }}
          fontWeight={FontWeight.sb}
          textColor={colors.text.subtitle}
          fontSizeType={FontSizeType.l}
          numberOfLines={1}
          ellipsizeMode={'tail'}>
          {superPortName}
        </NumberlessText>
      )}
      {!hasFailed && !isLoading && (
        <View style={styles.textBox}>
          <NumberlessText
            style={{
              textAlign: 'center',
              paddingHorizontal: Spacing.l,
            }}
            fontWeight={FontWeight.rg}
            textColor={colors.text.subtitle}
            fontSizeType={FontSizeType.m}>
            {'Publish this QR code or the link below to add new contacts'}
          </NumberlessText>
        </View>
      )}
      {link && (
        <TouchableOpacity onPress={onCopyClicked} activeOpacity={0.6}>
          <GradientCard style={styles.copyLinkCardWrapper}>
            <NumberlessText
              textColor={colors.text.buttonText}
              fontWeight={FontWeight.rg}
              fontSizeType={FontSizeType.m}
              numberOfLines={1}
              ellipsizeMode={'tail'}
              style={{flex: 1}}>
              {link}
            </NumberlessText>
            <Copy style={{marginLeft: Spacing.s}} />
          </GradientCard>
        </TouchableOpacity>
      )}
    </GradientCard>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    cardWrapper: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: Spacing.l,
      paddingVertical: Spacing.l,
      width: Width.screen - 2 * Spacing.l,
    },
    labelTextContainer: {
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.s,
      borderRadius: 48,
      marginTop: Spacing.xxl,
      marginBottom: Spacing.l,
    },
    textBox: {
      marginBottom: Spacing.l,
    },
    copyLinkCardWrapper: {
      paddingHorizontal: Spacing.l,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: Height.button,
      width: Width.screen - 4 * Spacing.l,
      backgroundColor: color.surface2,
    },
  });

export default DisplayableSuperPortQRCard;
