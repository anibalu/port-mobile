import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {FC} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {SvgProps} from 'react-native-svg';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

const TouchableOption = ({
  onClick,
  IconLeft,
  title,
  subtitle,
  showBorderBottom = true,
}: {
  onClick: () => void;
  IconLeft: FC<SvgProps>;
  title: string;
  subtitle: string;
  showBorderBottom?: boolean;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const svgArray = [
    {
      assetName: 'GreyAngleRight',
      light: require('@assets/light/icons/navigation/GreyAngleRight.svg')
        .default,
      dark: require('assets/dark/icons/navigation/GreyAngleRight.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);

  const GreyAngleRight = results.GreyAngleRight;

  return (
    <TouchableOpacity
      disabled={false}
      style={{
        paddingHorizontal: PortSpacing.secondary.uniform,
        backgroundColor: Colors.primary.surface,
      }}
      onPress={onClick}
      accessibilityIgnoresInvertColors
      activeOpacity={0.6}>
      <View
        style={StyleSheet.compose(styles.listItem, {
          borderBottomWidth: showBorderBottom ? 1 : 0,
        })}>
        <IconLeft width={24} height={24} />
        <View style={styles.listContentWrapper}>
          <NumberlessText
            style={{color: Colors.primary.mainelements}}
            fontSizeType={FontSizeType.l}
            fontType={FontType.md}>
            {title}
          </NumberlessText>
          <NumberlessText
            style={{color: Colors.text.subtitle}}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
            {subtitle}
          </NumberlessText>
        </View>
        <GreyAngleRight width={20} height={20} />
      </View>
    </TouchableOpacity>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    listItem: {
      paddingVertical: PortSpacing.secondary.uniform,
      borderRadius: 0,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      borderBottomColor: colors.primary.stroke,
    },
    listContentWrapper: {
      marginLeft: PortSpacing.secondary.uniform,
      flexDirection: 'column',
      flex: 1,
      gap: 4,
      alignItems: 'stretch',
      justifyContent: 'center',
    },
  });

export default TouchableOption;
