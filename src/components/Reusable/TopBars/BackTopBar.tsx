/**
 * Back Topbar.
 * Takes the following props:
 * 1. Icon left
 * 2. onIconLeftPress
 */

import {PortColors, PortSpacing} from '@components/ComponentUtils';
import React, {FC} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {View} from 'react-native';
import {SvgProps} from 'react-native-svg';

const BackTopbar = ({
  IconLeft,
  onIconLeftPress,
  bgColor = 'g',
}: {
  onIconLeftPress: () => void;
  IconLeft: FC<SvgProps>;
  bgColor?: 'w' | 'g';
}) => {
  return (
    <View
      style={StyleSheet.compose(styles.topbarAcontainer, {
        backgroundColor:
          bgColor == 'w' ? PortColors.primary.white : PortColors.background,
      })}>
      <Pressable onPress={onIconLeftPress}>
        <IconLeft width={24} height={24} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  topbarAcontainer: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    paddingHorizontal: PortSpacing.secondary.uniform,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PortColors.primary.white,
    height: 56,
  },
});

export default BackTopbar;
