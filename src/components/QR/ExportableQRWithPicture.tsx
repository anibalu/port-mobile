import React from 'react';
import {StyleSheet, View} from 'react-native';

import QRCode from 'react-native-qrcode-svg';

import {useThemeColors} from '@components/colorGuide';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import {Spacing, Width} from '@components/spacingGuide';
import useSVG from '@components/svgGuide';

import {jsonToUrl} from '@utils/JsonToUrl';

/**
 * Component to display a QR code with a profile picture that can be exported.
 * @param qrData - The data to encode in the QR code
 * @param theme - The theme of the component
 * @param profileUri - The URI of the profile picture
 * @param name - The name of the person
 * @returns The component to display a QR code with a profile picture
 */
const ExportableQRWithPicture = ({
  qrData,
  theme,
  profileUri,
  name,
}: {
  qrData: any;
  theme: 'light' | 'dark';
  profileUri?: string | null;
  name?: string | null;
}) => {
  const Colors = useThemeColors(theme);
  const svgArray = [
    {
      assetName: 'Logo',
      light: require('@assets/icons/PurplePortLogo.svg').default,
      dark: require('@assets/icons/WhitePortLogo.svg').default,
    },
  ];
  const results = useSVG(svgArray, theme);

  const Logo = results.Logo;

  return (
    <View style={{...styles.container, backgroundColor: Colors.surface}}>
      <Logo />
      <View style={styles.qrBox}>
        <QRCode
          backgroundColor={Colors.surface}
          color={Colors.accent}
          value={jsonToUrl(qrData as any) || 'https://porting.me'}
          size={styles.qrBox.width}
        />
        <AvatarBox
          avatarSize="i"
          profileUri={profileUri}
          style={{
            borderWidth: 2,
            borderColor: Colors.surface,
            borderRadius: 100,
            position: 'absolute',
          }}
        />
      </View>
      <View style={styles.textBox}>
        <NumberlessText
          style={{
            textAlign: 'center',
            paddingHorizontal: Spacing.l,
          }}
          fontWeight={FontWeight.rg}
          textColor={Colors.text.subtitle}
          fontSizeType={FontSizeType.m}>
          {'Scan this to connect on Port with'}
        </NumberlessText>
      </View>
      {name && (
        <NumberlessText
          style={{paddingHorizontal: Spacing.l, overflow: 'visible'}}
          fontWeight={FontWeight.sb}
          textColor={Colors.text.title}
          fontSizeType={FontSizeType.es}
          numberOfLines={1}
          ellipsizeMode={'tail'}>
          {name}
        </NumberlessText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    width: Width.screen - 2 * Spacing.l,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  qrBox: {
    marginTop: Spacing.xl,
    width: Width.screen - 6 * Spacing.l,
    height: Width.screen - 6 * Spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: {
    marginTop: Spacing.l,
    marginBottom: Spacing.s,
  },
});

export default ExportableQRWithPicture;
