/**
 * Back Topbar
 * This has a subtitle
 * Takes the following props:
 * 1. onBackPress
 */

import {PortColors, PortSpacing} from '@components/ComponentUtils';
import React from 'react';
import {Pressable, StyleSheet,View} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import DynamicColors from '@components/DynamicColors';
import {TOPBAR_HEIGHT} from '@configs/constants';

const BackTopbarWithSubtitle = ({
  onBackPress,
  bgColor = 'g',
  title = '',
  subtitle = '',
}: {
  onBackPress: () => void;
  bgColor?: 'w' | 'g';
  title: string;
  subtitle: string;
}) => {
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
  const Colors = DynamicColors();
  return (
    <View
      style={StyleSheet.compose(styles.topbarAcontainer, {
        backgroundColor:
          bgColor == 'w' ? Colors.primary.surface : Colors.primary.background,
      })}>
      <View>
        <NumberlessText
          style={{
            alignSelf: 'center',
            textAlign: 'center',
            flex: 1,
            marginTop: 10,
          }}
          textColor={Colors.text.primary}
          fontType={FontType.md}
          fontSizeType={FontSizeType.l}>
          {title}
        </NumberlessText>

        <NumberlessText
          textColor={Colors.text.subtitle}
          style={{
            alignSelf: 'center',
            textAlign: 'center',
            flex: 1,
          }}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}>
          {subtitle}
        </NumberlessText>
      </View>

      <Pressable style={styles.backButton} onPress={onBackPress}>
        <DynamicBackIcon width={24} height={24} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  topbarAcontainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: PortSpacing.secondary.uniform,
    alignItems: 'center',
    backgroundColor: PortColors.primary.white,
    height: TOPBAR_HEIGHT,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 16,
  },
});

export default BackTopbarWithSubtitle;
