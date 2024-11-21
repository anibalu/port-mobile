import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

const FolderOptionWithChevron = ({
  bgColor,
  Icon,
  text,
  subtitle,
  onPress,
}: {
  bgColor?: string;
  Icon: any;
  text: string;
  subtitle: string;
  onPress: () => void;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);

  const svgArray = [
    {
      assetName: 'AngleRight',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const BlackAngleRight = results.AngleRight;

  return (
    <Pressable
      style={StyleSheet.compose(styles.mainContainer, {
        backgroundColor: bgColor ? bgColor : 'transparent',
      })}
      onPress={onPress}>
      <Icon />
      <View style={{flex: 1}}>
        <NumberlessText
          style={{paddingLeft: PortSpacing.tertiary.left}}
          textColor={Colors.text.primary}
          fontType={FontType.sb}
          fontSizeType={FontSizeType.m}>
          {text}
        </NumberlessText>
        <NumberlessText
          style={{paddingHorizontal: PortSpacing.tertiary.left}}
          textColor={Colors.text.subtitle}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.s}>
          {subtitle}
        </NumberlessText>
      </View>
      <BlackAngleRight />
    </Pressable>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    mainContainer: {
      flexDirection: 'row',
      paddingVertical: PortSpacing.secondary.top,
      alignItems: 'flex-start',
      marginHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.primary.stroke,
      borderRadius: 16,
      paddingHorizontal: PortSpacing.secondary.uniform,
      marginTop: PortSpacing.tertiary.top,
    },
  });
export default FolderOptionWithChevron;
