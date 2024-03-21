/**
 * Back Topbar.
 * Takes the following props:
 * 1. onBackPress
 */

import {PortColors, PortSpacing} from '@components/ComponentUtils';
import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {View} from 'react-native';
import BackIcon from '@assets/navigation/backButton.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

const BackTopbar = ({
  onBackPress,
  bgColor = 'g',
  title = '',
}: {
  onBackPress: () => void;
  bgColor?: 'w' | 'g';
  title?: string;
}) => {
  return (
    <View
      style={StyleSheet.compose(styles.topbarAcontainer, {
        backgroundColor:
          bgColor == 'w' ? PortColors.primary.white : PortColors.background,
        alignSelf: title ? 'auto' : 'stretch',
      })}>
      {title && (
        <NumberlessText
          style={{
            alignSelf: 'center',
            textAlign: 'center',
            flex: 1,
          }}
          fontType={FontType.md}
          fontSizeType={FontSizeType.l}>
          {title}
        </NumberlessText>
      )}
      <Pressable style={styles.backButton} onPress={onBackPress}>
        <BackIcon width={24} height={24} />
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
    height: 56,
  },
  backButton: {
    position: 'absolute',
    left: 16,
  },
});

export default BackTopbar;
