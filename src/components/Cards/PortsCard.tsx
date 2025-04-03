import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import LineSeparator from '@components/Reusable/Separators/LineSeparator';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import ReusableIcon from '@assets/icons/Reusable.svg';

const PortsCard = ({
  title,
  folder: folderName,
  reusable = false,
  connectionsLeft,
  expiry,
}: {
  title: string;
  folder?: string;
  reusable?: boolean;
  connectionsLeft: number;
  expiry: string;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
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

  const results = useDynamicSVG(svgArray);
  const ClockIcon = results.ClockIcon;
  const AngleRight = results.AngleRight;

  // changes description text based on reusable or not
  const descriptionText = reusable
    ? `${connectionsLeft} uses left`
    : `Expires in ${expiry}`;

  return (
    <SimpleCard style={styles.cardContainer}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <NumberlessText
          style={{marginVertical: PortSpacing.tertiary.uniform}}
          textColor={Colors.text.primary}
          fontSizeType={FontSizeType.l}
          fontType={FontType.sb}>
          {title}
        </NumberlessText>

        {reusable ? (
          <View style={styles.reusableContainer}>
            <ReusableIcon />
            <NumberlessText
              textColor={Colors.boldAccentColors.violet}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              reusable
            </NumberlessText>
          </View>
        ) : (
          <></>
        )}
      </View>

      {folderName && (
        <View style={styles.folderContainer}>
          <NumberlessText
            textColor={Colors.boldAccentColors.blue}
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}>
            {folderName}
          </NumberlessText>
        </View>
      )}

      <LineSeparator />
      <View style={styles.bottomContainer}>
        <View style={styles.clockContainer}>
          <ClockIcon />
          <NumberlessText
            textColor={Colors.text.subtitle}
            fontSizeType={FontSizeType.s}
            fontType={FontType.md}>
            {descriptionText}
          </NumberlessText>
        </View>
        <AngleRight />
      </View>
    </SimpleCard>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    cardContainer: {
      paddingVertical: PortSpacing.secondary.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
      backgroundColor: colors.primary.surface,
      borderRadius: 16,
    },
    folderContainer: {
      backgroundColor: colors.lowAccentColors.blue,
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingVertical: PortSpacing.tertiary.uniform,
      borderRadius: 8,
    },
    clockContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: PortSpacing.tertiary.uniform,
    },
    reusableContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      borderRadius: 26,
      gap: 4,
      backgroundColor: colors.lowAccentColors.violet,
    },
    bottomContainer: {
      flexDirection: 'row',
      marginTop: PortSpacing.tertiary.uniform,
      justifyContent: 'space-between',
    },
  });

export default PortsCard;
