import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { useColors } from '@components/colorGuide';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import LineSeparator from '@components/Separators/LineSeparator';
import { Spacing } from '@components/spacingGuide';
import useSVG from '@components/svgGuide';

import { jsonToUrl } from '@utils/JsonToUrl';
import { Port } from '@utils/Ports/SingleUsePorts/Port';
import { SuperPort } from '@utils/Ports/SuperPorts/SuperPort';
import { getProfileName } from '@utils/Profile';
import { getExpiryTag } from '@utils/Time';

import ReusableIcon from '@assets/icons/Reusable.svg';

import { ToastType, useToast } from 'src/context/ToastContext';


const PortsCard = ({
  portId,
  title,
  folderId,
  reusable,
  connectionsLeft,
  expiry,
}: {
  portId: string;
  title: string;
  folderId?: string | null;
  reusable: boolean;
  connectionsLeft?: number | null;
  expiry?: string | null;
}) => {
  const navigation = useNavigation();
  const Colors = useColors();
  const styles = styling(Colors);
  const { showToast } = useToast();

  const svgArray = [
    {
      assetName: 'ClockIcon',
      light: require('@assets/light/icons/ClockIcon.svg').default,
      dark: require('@assets/dark/icons/ClockIcon.svg').default,
    },
    {
      assetName: 'AngleRight',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];

  const results = useSVG(svgArray);
  const ClockIcon = results.ClockIcon;
  const AngleRight = results.AngleRight;

  const onPress = async () => {
    if (reusable) {
      try {
        const superPortClass = await SuperPort.generator.fromPortId(portId);
        const name = await getProfileName();
        const bundle = await superPortClass.getShareableBundle(name);
        const link = jsonToUrl(bundle as any);
        (navigation as any).push('NewSuperPortStack', {
          screen: 'SuperPortQRScreen',
          params: {
            superPortClass: superPortClass,
            bundle: bundle,
            link: link || '',
          },
        });
      } catch (error) {
        console.error('Error fetching port data:', error);
        showToast('Error opening re-usable port. Try quitting and re-opening the app.', ToastType.error);
        return;
      }
    }
    else {
      try {
        const portClass = await Port.generator.fromPortId(portId);
        const name = await getProfileName();
        const bundle = await portClass.getShareableBundle(name);
        const link = jsonToUrl(bundle as any);
        (navigation as any).push('NewPortStack', {
          screen: 'PortQRScreen',
          params: {
            portClass: portClass,
            bundle: bundle,
            link: link || '',
          },
        });
      } catch (error) {
        console.error('Error fetching port data:', error);
        showToast('Error opening port. Try quitting and re-opening the app.', ToastType.error);
        return;
      }
    }
  };

  return (
    <Pressable style={styles.cardContainer} onPress={onPress}>
      <View style={styles.topContainer}>
        <View style={styles.titleContainer}>
          <NumberlessText
            textColor={Colors.text.title}
            fontSizeType={FontSizeType.l}
            fontWeight={FontWeight.sb}>
            {title}
          </NumberlessText>
          {folderId && (
            <View style={styles.folderContainer}>
              <NumberlessText
                textColor={Colors.boldAccentColors.blue}
                fontSizeType={FontSizeType.s}
                fontWeight={FontWeight.rg}>
                {'folder'}
              </NumberlessText>
            </View>
          )}
        </View>

        {reusable ? (
          <View style={styles.reusableContainer}>
            <ReusableIcon />
            <NumberlessText
              textColor={Colors.text.subtitle}
              fontSizeType={FontSizeType.s}
              fontWeight={FontWeight.rg}>
              Reusable
            </NumberlessText>
          </View>
        ) : (
          <></>
        )}
      </View>
      <LineSeparator gradient1borderColor={Colors.stroke} gradient2borderColor={Colors.stroke} />
      <View style={styles.bottomContainer}>
        <View style={styles.clockContainer}>
          <ClockIcon height={16} width={16} />
          <ExpiryText expiry={expiry} connectionsLeft={connectionsLeft} Colors={Colors} />
        </View>
        <AngleRight />
      </View>
    </Pressable>
  );
};

const ExpiryText = ({ expiry, connectionsLeft, Colors }: { expiry?: string | null, connectionsLeft?: number | null, Colors: any }) => {
  return (
    <View>
      {expiry && <NumberlessText
        textColor={Colors.text.subtitle}
        fontSizeType={FontSizeType.s}
        fontWeight={FontWeight.md}>
        {getExpiryTag(expiry)}
      </NumberlessText>}
      {connectionsLeft && <NumberlessText
        textColor={Colors.text.subtitle}
        fontSizeType={FontSizeType.s}
        fontWeight={FontWeight.md}>
        {connectionsLeft} use(s) left
      </NumberlessText>}
    </View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    cardContainer: {
      flexDirection: 'column',
      paddingVertical: Spacing.m,
      paddingHorizontal: Spacing.m,
      borderRadius: 16,
      backgroundColor: colors.surface1,
      borderWidth: 1,
      borderColor: colors.stroke,
      width: '100%',
      gap: Spacing.s,
    },
    topContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    titleContainer: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      gap: Spacing.xs,
    },
    folderContainer: {
      backgroundColor: colors.lowAccentColors.blue,
      paddingHorizontal: Spacing.s,
      paddingVertical: Spacing.xs,
      borderRadius: 16,
    },
    clockContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.s,
    },
    reusableContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.s,
      paddingVertical: Spacing.xs,
      borderRadius: 16,
      gap: Spacing.xs,
      backgroundColor: colors.surface2,
    },
    bottomContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  });

export default PortsCard;
