/**
 * Back Topbar.
 * Takes the following props:
 * 1. onBackPress
 */

import {PortSpacing} from '@components/ComponentUtils';
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

const BackTopbar = ({
  onBackPress,
  bgColor = 'g',
  title = '',
}: {
  onBackPress: () => void;
  bgColor?: 'w' | 'g';
  title?: string;
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
        alignSelf: title ? 'auto' : 'stretch',
      })}>
      {title && (
        <NumberlessText
          style={{
            alignSelf: 'center',
            textAlign: 'center',
            flex: 1,
          }}
          textColor={Colors.text.primary}
          fontType={FontType.md}
          fontSizeType={FontSizeType.xl}>
          {title}
        </NumberlessText>
      )}
      <Pressable style={styles.backButton} onPress={onBackPress}>
        <DynamicBackIcon width={24} height={24} />
      </Pressable>
    </View>
  );
};

const styling = (Color: any) =>
  StyleSheet.create({
    topbarAcontainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: PortSpacing.secondary.uniform,
      alignItems: 'center',
      backgroundColor: Color.primary.surface,
      height: TOPBAR_HEIGHT,
    },
    backButton: {
      position: 'absolute',
      left: 16,
    },
  });

export default BackTopbar;
