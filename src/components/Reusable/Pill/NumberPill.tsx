import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import useDynamicSVG from '@utils/Themes/createDynamicSVG';

import {useTheme} from 'src/context/ThemeContext';

const NumberPill = ({
  connectionLimit,
  setOpenUsageLimitsModal,
}: {
  connectionLimit: number;
  setOpenUsageLimitsModal: (x: boolean) => void;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const {themeValue} = useTheme();

  const svgArray = [
    {
      assetName: 'EditIcon',
      light: require('@assets/icons/PencilAccent.svg').default,
      dark: require('@assets/icons/PencilWhite.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const EditIcon = results.EditIcon;
  return (
    <Pressable
      style={StyleSheet.compose(styles.activePill, {
        backgroundColor:
          themeValue === 'light'
            ? Colors.lowAccentColors.violet
            : Colors.primary.accent,
      })}
      onPress={() => {
        setOpenUsageLimitsModal(true);
      }}>
      <NumberlessText
        style={{
          color:
            themeValue === 'light'
              ? Colors.primary.accent
              : Colors.primary.white,
        }}
        fontType={FontType.sb}
        fontSizeType={FontSizeType.m}>
        {connectionLimit}
      </NumberlessText>
      <EditIcon width={16} height={16} style={{marginLeft: 3}} />
    </Pressable>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    pill: {
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingVertical: PortSpacing.tertiary.uniform,
      borderRadius: 8,
      backgroundColor: color.primary.lightgrey,
      flexDirection: 'row',
    },
    activePill: {
      gap: 4,
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingVertical: PortSpacing.tertiary.uniform,
      borderRadius: 45,
      flexDirection: 'row',
    },
  });
export default NumberPill;
