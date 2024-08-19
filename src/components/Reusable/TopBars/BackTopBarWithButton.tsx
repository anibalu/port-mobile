/**
 * Back Topbar.
 * Takes the following props:
 * 1. onBackPress
 */

import {PortSpacing, screen} from '@components/ComponentUtils';
import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {View} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {TOPBAR_HEIGHT} from '@configs/constants';

const BackTopbarWithButton = ({
  onBackPress,
  bgColor = 'g',
  title = '',
  Icon,
  buttonName = '',
  onButtonPress,
}: {
  onButtonPress: () => void;
  onBackPress?: () => void;
  bgColor?: 'w' | 'g';
  title?: string;
  Icon?: any;
  buttonName: string;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);

  const svgArray = [
    // 1.NotificationOutline
    {
      assetName: 'DynamicBackIcon',
      light: require('@assets/light/icons/navigation/BlackArrowLeftThin.svg')
        .default,
      dark: require('@assets/dark/icons/navigation/BlackArrowLeftThin.svg')
        .default,
    },
  ];
  const results = useDynamicSVG(svgArray);

  const DynamicBackIcon = results.DynamicBackIcon;
  return (
    <View
      style={StyleSheet.compose(styles.topbarAcontainer, {
        backgroundColor:
          bgColor == 'w' ? Colors.primary.surface : Colors.primary.background,
      })}>
      <View style={{flexDirection: 'row'}}>
        {onBackPress && (
          <Pressable onPress={onBackPress}>
            <DynamicBackIcon width={24} height={24} />
          </Pressable>
        )}
        {title && (
          <NumberlessText
            style={{
              alignSelf: 'center',
              textAlign: 'left',
            }}
            textColor={Colors.text.primary}
            fontType={FontType.sb}
            fontSizeType={FontSizeType.xl}>
            {title}
          </NumberlessText>
        )}
      </View>
      <Pressable style={styles.button} onPress={onButtonPress}>
        {Icon && <Icon style={{marginRight: 5}} height={20} width={20} />}
        <NumberlessText
          textColor={Colors.text.primary}
          fontType={FontType.md}
          fontSizeType={FontSizeType.m}>
          {buttonName}
        </NumberlessText>
      </Pressable>
    </View>
  );
};

const styling = (Color: any) =>
  StyleSheet.create({
    topbarAcontainer: {
      flexDirection: 'row',
      paddingHorizontal: PortSpacing.secondary.uniform,
      alignItems: 'center',
      backgroundColor: Color.primary.surface,
      borderBottomColor: Color.primary.stroke,
      borderBottomWidth: 0.5,
      height: TOPBAR_HEIGHT,
      width: screen.width,
      justifyContent: 'space-between',
    },
    button: {
      borderRadius: PortSpacing.tertiary.uniform,
      borderWidth: 1,
      borderColor: Color.primary.mainelements,
      height: 35,
      justifyContent: 'center',
      paddingHorizontal: PortSpacing.tertiary.uniform,
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

export default BackTopbarWithButton;
