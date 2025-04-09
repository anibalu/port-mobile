/**
 * Back Topbar.
 * Takes the following props:
 * 1. onBackPress
 */

import React from 'react';
import {StyleSheet,View} from 'react-native';

import {BackButton} from '@components/BackButton';
import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

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
      <BackButton onPress={onBackPress} style={styles.backButton} />
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
      borderBottomWidth: 0.5,
      borderBottomColor: Color.primary.stroke,
    },
    backButton: {
      width: 24,
      alignItems: 'center',
      paddingTop: 13,
      position: 'absolute',
      left: 16,
    },
  });

export default BackTopbar;
