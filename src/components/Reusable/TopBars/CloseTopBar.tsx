/**
 * Close Topbar.
 * Takes the following props:
 * 1. onClosePress
 */

import React from 'react';
import {Pressable, StyleSheet,View} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {TOPBAR_HEIGHT} from '@configs/constants';

import useDynamicSVG from '@utils/Themes/createDynamicSVG';

const CloseTopBar = ({
  onClosePress,
  bgColor = 'g',
  title = '',
}: {
  onClosePress: () => void;
  bgColor?: 'w' | 'g';
  title?: string;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);

  const svgArray = [
    // 1.NotificationOutline
    {
      assetName: 'DynamicBackIcon',
      light: require('@assets/light/icons//Close.svg').default,
      dark: require('@assets/dark/icons//Close.svg').default,
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
            flex: 1,
          }}
          textColor={Colors.text.primary}
          fontType={FontType.md}
          fontSizeType={FontSizeType.xl}>
          {title}
        </NumberlessText>
      )}
      <Pressable onPress={onClosePress}>
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
  });

export default CloseTopBar;
