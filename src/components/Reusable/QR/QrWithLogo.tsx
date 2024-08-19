/**
 * Card that displays a port
 */

import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
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
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import DynamicColors from '@components/DynamicColors';

const QrWithLogo = ({
  isLoading,
  hasFailed,
  qrData,
  profileUri,
  tobeEdited,
  onClickAvatar,
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
  tobeEdited?: boolean;
  onClickAvatar?: () => void;
}) => {
  const svgArray = [
    // 1.NotificationOutline
    {
      assetName: 'EditCameraIcon',
      light: require('@assets/light/icons/EditCamera.svg').default,
      dark: require('@assets/dark/icons/EditCamera.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);

  const EditCameraIcon = results.EditCameraIcon;
  const Colors = DynamicColors();
  const styles = styling(Colors);
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
            {tobeEdited && (
              <Pressable
                onPress={onClickAvatar}
                style={styles.cameraIconWrapper}>
                <EditCameraIcon height={12} width={12} />
              </Pressable>
            )}
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

const styling = (colors: any) =>
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
      padding: 2,
      backgroundColor: PortColors.primary.white,
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cameraIconWrapper: {
      width: 20,
      bottom: -4,
      right: 0,
      height: 20,
      backgroundColor: colors.primary.accent,
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 9,
    },
  });

export default QrWithLogo;
